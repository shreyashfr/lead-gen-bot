# Lead Gen API Status Report

## Architecture Summary

| Component | Status | Method | Notes |
|-----------|--------|--------|-------|
| **LinkedIn Jobs** | ✅ Ready | Direct API (Voyager) | Fast, no browser |
| **SalesNav** | ✅ Ready | Serper API + Fallback | Requires Serper API key OR fallback to Jobs |
| **Indeed** | ⚠️ Browser | Puppeteer | Dynamic rendering required |
| **Glassdoor** | ⚠️ Browser | Puppeteer | Dynamic rendering required |
| **YC** | ✅ Ready | Axios + Cheerio | Static HTML scraping |
| **Dice** | ✅ Ready | Axios + Cheerio | Static HTML scraping |
| **WellFound** | ✅ Ready | Serper API | Third-party job search |

---

## Quick Start

### 1. **Configure Sessions**
Edit `config/sessions.json`:
```json
{
  "linkedin": {
    "li_at": "YOUR_LI_AT_COOKIE",
    "JSESSIONID": "YOUR_JSESSIONID"
  },
  "salesnav": {
    "li_a": "YOUR_LI_A_COOKIE",
    "JSESSIONID": "YOUR_JSESSIONID"
  },
  "proxy": {
    "server": "http://proxy-10003.useragent.decodo.com:10003",
    "username": "decodo_username",
    "password": "decodo_password"
  },
  "serper": {
    "apiKey": "YOUR_SERPER_API_KEY"  // Optional but recommended for SalesNav
  }
}
```

### 2. **Test Individual Scrapers**
```bash
node test-api-scrapers.js
```

### 3. **Start Server**
```bash
npm start
# or
node server.js
```

### 4. **Use the API**
```bash
# Register user
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","product":"SaaS","icp":"Tech","titles":"VP Marketing"}'

# Start scan
curl -X POST http://localhost:3000/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"userId":"user1","count":20,"query":"marketing USA"}'

# Poll results
curl http://localhost:3000/poll/user1/scan_id
```

---

## Key Decisions

### ✅ Why No Puppeteer for LinkedIn?
- LinkedIn Voyager API supports direct HTTP requests
- Only Jobs API works without CSRF (Serper handles SalesNav)
- Faster execution, lower resource usage

### ⚠️ Why Keep Puppeteer for Indeed/Glassdoor?
- Both sites heavily rely on JavaScript rendering
- No public API available
- HTML parsing won't extract dynamic data
- Browser automation is the only reliable method

### 🔄 Why Serper for SalesNav?
- LinkedIn's Sales API requires CSRF tokens (browser-only)
- Serper.dev is a paid third-party search wrapper
- Cost: ~$5/month for full access
- Alternative: Fallback to LinkedIn Jobs results (free but less targeted)

---

## Cost Breakdown

### Infrastructure Costs
| Service | Cost | Usage |
|---------|------|-------|
| Decodo Proxy | $X/month | IP rotation for all scrapers |
| Serper API | $5-50/month | Optional: Full SalesNav support |
| **Total** | **~$5-50/month** | Depending on Serper plan |

### Free Alternatives
- **SalesNav Fallback:** Use LinkedIn Jobs results (returns leads but less specific)
- **Indeed/Glassdoor:** Already included (no extra cost beyond server)
- **YC/Dice/WellFound:** All free (third-party APIs included)

---

## Troubleshooting

### LinkedIn Jobs Returns Empty
**Fix:** Check `li_at` cookie expiry
```bash
# Test with diagnostic
curl -H "Cookie: li_at=YOUR_COOKIE" https://www.linkedin.com/voyager/api/me
# Should return 200 (valid) or 403 (expired)
```

### SalesNav Returns Fallback Results
**Fix:** Either:
1. Configure Serper API key in `config/sessions.json`
2. Accept LinkedIn Jobs results as fallback

### CSRF Token Errors
**Check:** Are you seeing 403 CSRF errors?
- ✅ Expected if using Voyager directly (our code avoids this)
- ❌ If you see this, the proxy/cookies might be misconfigured

---

## Performance Metrics

### Expected Response Times (per scraper)
- **LinkedIn Jobs:** 2-4 seconds
- **SalesNav (Serper):** 3-5 seconds  
- **Indeed (Browser):** 10-20 seconds
- **Glassdoor (Browser):** 10-20 seconds
- **YC/Dice:** 2-5 seconds

### Parallel Execution
All 7 scrapers run in parallel via `Promise.allSettled()`:
- Single user scan: ~20-25 seconds total
- Concurrent users: Resource-dependent (browser instances are expensive)

---

## Next Steps

1. ✅ Update `config/sessions.json` with valid cookies
2. ✅ (Optional) Register for Serper API key
3. ✅ Test with `node test-api-scrapers.js`
4. ✅ Start the server with `node server.js`
5. ✅ Begin running `/scan` requests

---

## Questions?

- **LinkedIn API issues?** Check cookie expiry and proxy connection
- **Serper API needed?** Visit https://serper.dev for free tier
- **Performance problems?** Consider increasing proxy limits or running fewer parallel requests
