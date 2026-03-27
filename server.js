const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 4000;
const JWT_SECRET = 'your_jwt_secret'; // Change in production

app.use(express.json());

// Middleware to validate JWT
const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin required.' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

// /api/register - POST for admin login to get JWT
app.post('/api/register', (req, res) => {
  const { username, password } = req.body; // Fixed destructuring
  if (username === 'admin' && password === 'bl') {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// /admin/test-sources - POST, requires admin JWT
app.post('/admin/test-sources', validateToken, async (req, res) => {
  const results = {};
  const sources = [
    'yc', 'dice', 'linkedin', 'wellfound', 'salesnav', 'indeed', 'glassdoor'
  ];

  for (const source of sources) {
    try {
      let sample = null;
      let error = null;

      switch (source) {
        case 'yc':
          // YC: axios no proxy
          const ycRes = await axios.get('https://www.ycombinator.com/companies', { timeout: 5000 });
          sample = ycRes.data.substring(0, 200); // Sample text
          break;

        case 'dice':
          // Dice: axios HTTP fallback no proxy
          const diceRes = await axios.get('https://www.dice.com/jobs', { 
            httpAgent: new (require('http').Agent)({ keepAlive: true }), 
            timeout: 5000 
          });
          sample = diceRes.data.substring(0, 200);
          break;

        case 'linkedin':
          // LinkedIn: Voyager cookie li_at no Bearer
          const liCookie = 'li_at=your_li_at_cookie_here'; // Placeholder - replace with actual
          const liRes = await axios.get('https://www.linkedin.com/voyager/api/search/hits?keywords=software%20engineer&origin=SWITCH_SEARCH_VERTICAL&q=software%20engineer', {
            headers: {
              'Cookie': liCookie,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            timeout: 5000
          });
          sample = JSON.stringify(liRes.data).substring(0, 200);
          break;

        case 'wellfound':
          // Wellfound: Serper API
          const serperApiKey = 'your_serper_api_key'; // Placeholder
          const wfRes = await axios.post('https://google.serper.dev/search', {
            q: 'software engineer jobs site:wellfound.com'
          }, {
            headers: { 'X-API-KEY': serperApiKey, 'Content-Type': 'application/json' },
            timeout: 5000
          });
          sample = JSON.stringify(wfRes.data).substring(0, 200);
          break;

        case 'salesnav':
          // Sales Nav: cookies li_a / JSESSIONID
          const salesCookies = 'li_a=your_li_a; JSESSIONID=your_jsessionid'; // Placeholder
          const salesRes = await axios.get('https://www.linkedin.com/sales/search/people?keywords=software%20engineer', {
            headers: {
              'Cookie': salesCookies,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            timeout: 5000
          });
          sample = salesRes.data.substring(0, 200);
          break;

        case 'indeed':
          // Indeed: Puppeteer proxy 10003 cookies
          const browser = await puppeteer.launch({
            headless: true,
            args: ['--proxy-server=localhost:10003']
          });
          const page = await browser.newPage();
          // Load cookies - assume from file or hardcoded
          const indeedCookies = [{name: 'some_cookie', value: 'value', domain: '.indeed.com'}]; // Placeholder
          await page.setCookie(...indeedCookies);
          await page.goto('https://www.indeed.com/jobs?q=software+engineer');
          sample = await page.content().then(c => c.substring(0, 500));
          await browser.close();
          break;

        case 'glassdoor':
          // Glassdoor: Puppeteer proxy 10003 new cookies
          const browser2 = await puppeteer.launch({
            headless: true,
            args: ['--proxy-server=localhost:10003']
          });
          const page2 = await browser2.newPage();
          // New cookies - different set
          const glassdoorCookies = [{name: 'gd_cookie', value: 'value', domain: '.glassdoor.com'}]; // Placeholder
          await page2.setCookie(...glassdoorCookies);
          await page2.goto('https://www.glassdoor.com/Job/software-engineer-jobs-SRCH_KO0,17.htm');
          sample = await page2.content().then(c => c.substring(0, 500));
          await browser2.close();
          break;

        default:
          throw new Error('Unknown source');
      }

      results[source] = { status: 'ok', error: null, sample };
    } catch (err) {
      results[source] = { status: 'failed', error: err.message, sample: null };
    }

    // 2s delay between tests, except last
    if (source !== sources[sources.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});