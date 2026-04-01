const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

app.use(cors());
app.use(bodyParser.json());

// Load config
const configPath = path.join(__dirname, 'config', 'sessions.json');
let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error('Error loading config:', err);
  config = {};
}

// Middleware for authentication (for admin routes)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Import scrapers (require dynamically)
const scrapers = {
  yc: require('./scripts/yc-scraper'),
  dice: require('./scripts/dice-scraper'),
  linkedin: require('./scripts/linkedin-jobs'),
  wellfound: require('./scripts/wellfound-serper'),
  glassdoor: require('./scripts/glassdoor-scraper'),
  indeed: require('./scripts/indeed-scraper'),
  salesnav: require('./scripts/salesnav-scraper')
};

// In-memory storage for sessions/leads (use DB in production)
const userSessions = {};
const leads = {};

// Register endpoint
app.post('/register', (req, res) => {
  const { userId, product, icp, titles } = req.body;
  if (!userId || !product || !icp || !titles) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  userSessions[userId] = { product, icp, titles, onboardedAt: new Date().toISOString() };
  res.json({ message: 'Registered successfully', userId });
});

// Scan endpoint - starts scraping in background
app.post('/scan', authenticateToken, async (req, res) => {
  const { userId, count = 20, query = 'marketing USA', company = null } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const session = userSessions[userId];
  if (!session) return res.status(400).json({ error: 'User not registered' });

  // Parse query if custom, else use session
  const searchParams = parseQuery(query, session);
  
  // Add company if specified (for company-first search)
  if (company) {
    searchParams.company = company;
  }

  leads[userId] = { status: 'scanning', leads: [], startedAt: new Date().toISOString(), params: searchParams };

  // Run scrapers in parallel, distribute across sources
  const sourceLeads = await Promise.allSettled([
    scrapers.yc.scrape(searchParams, count / 7),
    scrapers.dice.scrape(searchParams, count / 7),
    scrapers.linkedin.scrape(searchParams, count / 7),
    scrapers.wellfound.scrape(searchParams, count / 7),
    scrapers.glassdoor.scrape(searchParams, count / 7),
    scrapers.indeed.scrape(searchParams, count / 7),
    scrapers.salesnav.scrape(searchParams, count / 7)
  ]);

  // Collect successful leads
  sourceLeads.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value) {
      leads[userId].leads.push(...result.value);
    }
  });

  leads[userId].leads = leads[userId].leads.slice(0, count); // Limit
  leads[userId].status = 'complete';
  leads[userId].completedAt = new Date().toISOString();

  res.json({ message: 'Scan started', scanId: userId + '_' + Date.now() });
});

// Poll endpoint
app.get('/poll/:userId/:scanId', (req, res) => {
  const { userId, scanId } = req.params;
  const userLeads = leads[userId];
  if (!userLeads) return res.status(404).json({ error: 'No leads found' });

  res.json(userLeads);
});

// Admin test-sources
app.post('/admin/test-sources', authenticateToken, async (req, res) => {
  const { source, query = 'marketing USA', count = 5 } = req.body;
  if (!scrapers[source]) return res.status(400).json({ error: 'Unknown source' });

  try {
    const results = await scrapers[source].scrape({ query }, count);
    res.json({ source, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Company-First Lead Search (Recommended for accurate results)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /leads/company
 * Get leads from a specific company
 * 
 * Body: {
 *   company: "Stripe",        // Required: company name
 *   role: "VP Engineering",   // Optional: title filter
 *   count: 10                 // Optional: number of leads (default 10)
 * }
 */
app.post('/leads/company', async (req, res) => {
  const { company, role = '', count = 10 } = req.body;
  
  if (!company) {
    return res.status(400).json({ error: 'company is required' });
  }
  
  try {
    const leads = await scrapers.salesnav.scrape({ company, role }, count);
    res.json({
      success: true,
      company: company,
      role: role || 'decision makers',
      count: leads.length,
      leads: leads
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /leads/search
 * Keyword-based lead search (less accurate, use /leads/company when possible)
 * 
 * Body: {
 *   role: "AI startup CEO",   // Required: role/title keywords
 *   location: "San Francisco", // Optional: location filter
 *   count: 10                  // Optional: number of leads
 * }
 */
app.post('/leads/search', async (req, res) => {
  const { role, location = '', count = 10 } = req.body;
  
  if (!role) {
    return res.status(400).json({ error: 'role is required' });
  }
  
  try {
    const leads = await scrapers.salesnav.scrape({ role, location }, count);
    res.json({
      success: true,
      query: { role, location },
      count: leads.length,
      leads: leads
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /leads/from-jobs
 * Get leads from companies that have job postings
 * Takes job search results and finds decision makers at those companies
 * 
 * Body: {
 *   jobs: [{ company: "Stripe", ... }, ...],  // Job objects with company field
 *   role: "VP Engineering",                    // Role to search for at each company
 *   leadsPerCompany: 3                         // Leads per company (default 3)
 * }
 */
app.post('/leads/from-jobs', async (req, res) => {
  const { jobs, role = 'VP Engineering OR Director OR Head', leadsPerCompany = 3 } = req.body;
  
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return res.status(400).json({ error: 'jobs array is required' });
  }
  
  const allLeads = [];
  const errors = [];
  
  // Dedupe companies
  const companies = [...new Set(jobs.map(j => j.company).filter(Boolean))];
  
  for (const company of companies.slice(0, 10)) { // Limit to 10 companies
    try {
      const leads = await scrapers.salesnav.scrape({ company, role }, leadsPerCompany);
      allLeads.push(...leads.map(l => ({ ...l, sourceCompany: company })));
    } catch (err) {
      errors.push({ company, error: err.message });
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }
  
  res.json({
    success: true,
    companiesSearched: companies.slice(0, 10).length,
    totalLeads: allLeads.length,
    leads: allLeads,
    errors: errors.length > 0 ? errors : undefined
  });
});

// Helper to parse query
function parseQuery(query, session) {
  // Simple parsing: assume 'marketing USA' -> {role: 'marketing', location: 'USA'}
  const parts = query.toLowerCase().split(' ');
  return {
    role: parts[0] || session.titles.split(',')[0],
    location: parts[1] || 'USA',
    industry: session.icp,
    titles: session.titles,
    count: 20
  };
}

// Basic login for admin (in production, use proper auth)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.listen(PORT, () => {
  console.log(`Lead Gen Bot API running on port ${PORT}`);
});

module.exports = app;