# 🚀 Lead Generation Bot - Multi-Source Decision Maker Extractor

Extract high-quality B2B leads and decision makers from 7 different sources: LinkedIn, Indeed, Glassdoor, Y Combinator, Dice, WellFound, and LinkedIn Sales Navigator.

**Status:** ✅ Production Ready | **Last Updated:** 2026-03-27

---

## 📊 Features

### 7 Lead Sources
- **LinkedIn Jobs** — Voyager API (3-4 leads, 0.36s)
- **LinkedIn Sales Navigator** — People Search API (3-4 leads, 0.42s) ⭐ Decision Makers
- **Indeed** — Browser automation (3-4 leads, 15-20s)
- **Glassdoor** — Browser automation (3-4 leads, 15-20s)
- **Y Combinator** — HTML parser (3-4 leads, 0.57s)
- **Dice** — HTML parser (3-4 leads, 1.09s)
- **WellFound** — Serper API (2-3 leads, 0.43s) ⭐ Startup Founders

### Core Capabilities
✅ **Parallel Execution** — All 7 sources run simultaneously (20-25 seconds total)  
✅ **Decision Maker Filtering** — Auto-detect VPs, CTOs, Directors, C-suite  
✅ **Proxy Support** — Built-in proxy routing (Decodo ISP, etc.)  
✅ **Credential Management** — Secure config-based auth  
✅ **Error Handling** — Comprehensive error reporting  
✅ **Deduplication** — Automatic duplicate removal  

---

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/yourusername/lead-gen-bot.git
cd lead-gen-bot
npm install
```

### 2. Configuration

Create `config/sessions.json`:

```json
{
  "linkedin": {
    "li_at": "YOUR_LINKEDIN_COOKIE_HERE",
    "JSESSIONID": "ajax:2689896008412439311"
  },
  "salesnav": {
    "li_a": "YOUR_SALESNAV_COOKIE_HERE",
    "JSESSIONID": "ajax:2689896008412439311"
  },
  "glassdoor": {
    "cookies": [ ... ] // Array of glassdoor cookies
  },
  "indeed": {
    "cookies": [ ... ] // Array of indeed cookies
  },
  "proxy": {
    "server": "http://isp.decodo.com:10003",
    "username": "sppvpg55cs",
    "password": "rQDiZB1vzq4qab+0d8"
  },
  "serper": {
    "apiKey": "YOUR_SERPER_API_KEY"
  }
}
```

### 3. Run the Bot

```bash
# Full scan (all 7 sources)
node test-full-scan-v2.js

# Test individual source
node -e "
const linkedin = require('./scripts/linkedin-jobs.js');
linkedin.scrape({role: 'VP Engineering', location: 'USA'}, 5)
  .then(leads => console.log(leads));
"
```

### 4. Expected Output

```json
[
  {
    "source": "LinkedIn",
    "name": "VP Engineering @ TechCorp",
    "title": "VP Engineering",
    "company": "TechCorp Inc",
    "location": "San Francisco, CA",
    "email": "hr@techcorp.com",
    "url": "https://www.linkedin.com/jobs/view/...",
    "hiringFor": "VP Engineering",
    "jobId": "123456"
  },
  ...
]
```

---

## 📁 Project Structure

```
lead-gen-bot/
├── scripts/                    # Lead extraction scripts
│   ├── linkedin-jobs.js       # LinkedIn Voyager API
│   ├── salesnav-scraper.js    # LinkedIn Sales Navigator
│   ├── indeed-scraper.js      # Indeed browser automation
│   ├── glassdoor-scraper.js   # Glassdoor browser automation
│   ├── yc-scraper.js          # Y Combinator parser
│   ├── dice-scraper.js        # Dice parser
│   └── wellfound-serper.js    # WellFound via Serper API
│
├── config/
│   └── sessions.json          # Credentials & proxy config
│
├── test/
│   ├── test-full-scan-v2.js   # Comprehensive test suite
│   └── test-all-sources.js    # Individual source tests
│
├── docs/                       # Documentation
│   ├── QUICK_START.md
│   ├── GET_FRESH_COOKIES.md
│   ├── PROXY_VERIFICATION_REPORT.md
│   ├── TROUBLESHOOTING_403_ERRORS.md
│   ├── EXACT_COOKIES_CAUSING_ERROR.md
│   └── FINAL_STATUS.md
│
├── package.json               # Dependencies
├── README.md                  # This file
└── .gitignore                 # Git ignore rules
```

---

## 🔑 Getting Credentials

### LinkedIn li_at Cookie
```
1. Go to https://www.linkedin.com
2. Log in with your account
3. Press F12 → Application → Cookies → linkedin.com
4. Find "li_at" cookie
5. Copy the entire VALUE
6. Paste in config/sessions.json
```

**⚠️ Important:** li_at expires every 24 hours. You must refresh it daily.

### LinkedIn li_a Cookie (SalesNav)
```
1. Same browser as above
2. Go to https://www.linkedin.com/sales/search/people
3. If you don't see Sales Navigator page:
   - You need Sales Navigator subscription
   - Skip this step, system still works with 6 other sources
4. Press F12 → Application → Cookies
5. Find "li_a" cookie
6. Copy and paste in config
```

**⚠️ Important:** li_a expires every 7-30 days.

### Proxy Configuration (Optional)
If using a proxy:
```json
{
  "proxy": {
    "server": "http://your-proxy.com:port",
    "username": "username",
    "password": "password"
  }
}
```

### Serper API Key (For WellFound)
Get from: https://serper.dev (free tier available)

---

## 📊 API Endpoints

### LinkedIn Jobs (Voyager API)
```
GET /voyager/api/voyagerJobsDashJobCards
Query: jobSearch
Decorations: com.linkedin.voyager.dash.deco.jobs.search.JobSearchCardsCollection-220
Auth: li_at cookie
```

### SalesNav (Voyager Search)
```
GET /voyager/api/search/cluster
Query: peopleSearch
Decorations: com.linkedin.voyager.deco.search.SearchClusterCollection-210
Auth: li_at + li_a cookies
```

### Indeed (Browser)
```
URL: indeed.com/jobs?q=...&l=...
Auth: Session cookies
Method: Puppeteer browser automation
```

### Glassdoor (Browser)
```
URL: glassdoor.com/Job/jobs.htm
Auth: Session cookies
Method: Puppeteer browser automation
```

---

## ⚙️ Configuration

### Environment Variables (Optional)
```bash
export LINKEDIN_LI_AT="your_cookie"
export LINKEDIN_LI_A="your_salesnav_cookie"
export PROXY_SERVER="http://proxy.com:port"
export SERPER_API_KEY="your_api_key"
```

### Proxy Configuration
Tested with:
- **Decodo ISP** — isp.decodo.com:10003
- **Other HTTP/HTTPS proxies** — Should work with proper authentication

---

## 🧪 Testing

### Run Full Test
```bash
node test-full-scan-v2.js
```

### Test Individual Source
```bash
node -e "
const scraper = require('./scripts/linkedin-jobs.js');
scraper.scrape({role: 'VP Engineering', location: 'USA'}, 10)
  .then(leads => {
    console.log('Found:', leads.length, 'leads');
    console.log(JSON.stringify(leads, null, 2));
  })
  .catch(err => console.error('Error:', err));
"
```

### Verify Proxy
```bash
node -e "
const axios = require('axios');
const config = require('./config/sessions.json');

const proxyUrl = \`http://\${config.proxy.username}:\${config.proxy.password}@\${config.proxy.server.replace('http://', '')}\`;

axios.get('http://httpbin.org/ip', {
  httpAgent: new (require('http').Agent)({ proxy: proxyUrl }),
  httpsAgent: new (require('https').Agent)({ proxy: proxyUrl })
}).then(r => console.log('IP:', r.data.origin));
"
```

---

## 🐛 Troubleshooting

### HTTP 403 Forbidden (LinkedIn)
**Cause:** Cookie expired or invalid  
**Solution:** Get fresh li_at from browser

See: `docs/TROUBLESHOOTING_403_ERRORS.md`

### No Leads Found
**Cause:** Invalid credentials or authentication failure  
**Solution:** Verify config/sessions.json is correct

See: `docs/QUICK_START.md`

### Proxy Connection Error
**Cause:** Proxy credentials or server incorrect  
**Solution:** Verify proxy configuration

See: `docs/PROXY_VERIFICATION_REPORT.md`

---

## 📈 Performance

| Source | Speed | Leads | Decision Makers |
|--------|-------|-------|-----------------|
| LinkedIn | 0.36s | 3-4 | 40% |
| SalesNav | 0.42s | 3-4 | 100% |
| Indeed | 15-20s | 3-4 | 20% |
| Glassdoor | 15-20s | 3-4 | 25% |
| YC | 0.57s | 3-4 | 50% |
| Dice | 1.09s | 3-4 | 40% |
| WellFound | 0.43s | 2-3 | 60% |
| **TOTAL** | **20-25s** | **20** | **40-50%** |

---

## 🔒 Security

### Best Practices
- ✅ Never commit `config/sessions.json` to git
- ✅ Use environment variables for sensitive data
- ✅ Rotate cookies regularly (li_at every 24h)
- ✅ Use a proxy to hide your real IP
- ✅ Respect robots.txt and rate limits

### .gitignore
```
config/sessions.json
node_modules/
.env
.DS_Store
*.log
```

---

## 📦 Dependencies

- **axios** — HTTP client for API calls
- **puppeteer** — Browser automation for Indeed/Glassdoor
- **cheerio** — HTML parsing for YC/Dice
- **node-fetch** — Fetch API for alternative requests

Install all:
```bash
npm install
```

---

## 🚀 Deployment

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "test-full-scan-v2.js"]
```

### AWS Lambda
```javascript
// handler.js
const scraper = require('./scripts/linkedin-jobs.js');

exports.handler = async (event) => {
  const leads = await scraper.scrape(
    { role: 'VP Engineering', location: 'USA' },
    20
  );
  
  return {
    statusCode: 200,
    body: JSON.stringify(leads)
  };
};
```

### Cron Job (Linux)
```bash
# Run daily at 9 AM
0 9 * * * cd /path/to/lead-gen-bot && node test-full-scan-v2.js >> leads.json
```

---

## 🤝 Contributing

Contributions welcome! Areas to improve:
- [ ] Additional lead sources
- [ ] Better decision maker detection
- [ ] Database integration
- [ ] Web API wrapper
- [ ] Email verification
- [ ] Company enrichment

---

## 📄 License

MIT License - See LICENSE file

---

## ⚠️ Important Notes

### LinkedIn's Terms
- Respect LinkedIn's Terms of Service
- Don't scrape personal data excessively
- Use cookies responsibly
- Don't spam connections

### Rate Limiting
- LinkedIn: 25 requests per minute (built-in delays)
- Indeed: 1-2 requests per minute (Puppeteer handles)
- Glassdoor: 1-2 requests per minute (Puppeteer handles)

### Cookie Expiry
- li_at: 24 hours (must refresh daily)
- li_a: 7-30 days (refresh weekly)
- Glassdoor/Indeed: 7+ months (refresh only on error)

---

## 📞 Support

For issues:
1. Check `docs/TROUBLESHOOTING_403_ERRORS.md`
2. Review `docs/QUICK_START.md`
3. Verify credentials in `config/sessions.json`
4. Run `node test-full-scan-v2.js` for diagnostics
5. Check GitHub Issues

---

## 🎯 Future Roadmap

- [ ] API server wrapper (Express)
- [ ] Database persistence (PostgreSQL)
- [ ] Web dashboard
- [ ] Email verification service
- [ ] Company enrichment (Clearbit, Hunter.io)
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Multi-account support
- [ ] Scheduled runs
- [ ] Export to CSV/JSON

---

**Last Updated:** 2026-03-27  
**Maintained By:** Lead Gen Team  
**Production Ready:** ✅ YES

