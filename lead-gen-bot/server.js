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
  const { userId, count = 20, query = 'marketing USA' } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const session = userSessions[userId];
  if (!session) return res.status(400).json({ error: 'User not registered' });

  // Parse query if custom, else use session
  const searchParams = parseQuery(query, session);

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