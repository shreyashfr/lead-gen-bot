# Sales Navigator API - Quick Reference

## TL;DR

**Sales Navigator API endpoint for decision makers:**

```bash
GET https://www.linkedin.com/sales-api/salesApiEntities?q=VP%20Marketing%20USA&count=50
Headers:
  - Cookie: li_at=...; li_a=...
  - X-Requested-With: XMLHttpRequest
```

**Response:** JSON with `data.elements[]` containing profiles with `title`, `company`, `location`, `profileId`

**Filtering:** Automatically extracts VP, C-level, Directors (decision makers)

---

## Quick Commands

### Test API
```bash
node test-salesnav-api.js
```

### Check Cookies Valid
```bash
curl -H "Cookie: li_at=YOUR_COOKIE" https://www.linkedin.com/voyager/api/me
# 200 = valid, 403 = expired
```

### Run Scraper
```bash
node scripts/salesnav-scraper.js
```

### View Decision Makers Only
```javascript
const scraper = require('./scripts/salesnav-scraper');
const leads = await scraper.scrape({ role: 'VP Marketing', location: 'USA' }, 50);
const decisionMakers = leads.filter(l => l.isDecisionMaker === true);
console.log(decisionMakers);
```

---

## Endpoint Reference

| Endpoint | URL | Auth | CSRF | Status |
|----------|-----|------|------|--------|
| **Primary** | `/sales-api/salesApiEntities` | `li_at` + `li_a` | ❌ No | ✅ Working |
| **Fallback** | `/voyager/api/search/hits` | `li_at` + `li_a` | ❌ No | ✅ Working |
| Blocked | `/voyager/api/graphql` | Same | ✅ Yes | ❌ CSRF fail |
| Blocked | `/voyager/api/search/cluster` | Same | ✅ Yes | ❌ CSRF fail |

---

## Profile Fields

Each profile includes:
```javascript
{
  profileId: "johndoe",
  displayName: "John Doe",
  title: "VP Marketing",
  company: "Acme Corp",
  location: "San Francisco, CA",
  headline: "VP Marketing at Acme...",
  publicIdentifier: "johndoe",
  entityUrn: "urn:li:fsd_profile:...",
  ...otherFields
}
```

---

## Decision Maker Levels

| Seniority | Pattern | Keep? |
|-----------|---------|-------|
| executive | VP, Chief, CEO, President, Founder | ✅ |
| director | Director, VP of, Head of, Senior Director | ✅ |
| senior | Senior Manager, Lead | ✅ |
| manager | Manager | ✅ |
| individual contributor | Engineer, Analyst, Specialist (no Sr.) | ❌ |

---

## Code Examples

### Search for VPs
```javascript
const scraper = require('./scripts/salesnav-scraper');
const leads = await scraper.scrape({ 
  role: 'VP Marketing', 
  location: 'California' 
}, 50);

leads.forEach(l => 
  console.log(`${l.name} @ ${l.company} - ${l.seniority}`)
);
```

### Filter by Seniority
```javascript
const executives = leads.filter(l => l.seniority === 'executive');
const directors = leads.filter(l => l.seniority === 'director');
```

### Get LinkedIn Profile URLs
```javascript
const urls = leads.map(l => l.url);
console.log(urls);
// ['https://linkedin.com/in/johndoe', ...]
```

### Export to CSV
```javascript
const csv = leads.map(l => 
  `${l.name},${l.title},${l.company},${l.location}`
).join('\n');

const fs = require('fs');
fs.writeFileSync('leads.csv', 'Name,Title,Company,Location\n' + csv);
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` | Expired cookies | Update `li_at` and `li_a` |
| `403 Forbidden` | Access denied | Check proxy credentials |
| `429 Too Many Requests` | Rate limited | Wait or use different proxy |
| Empty results `[]` | Bad search query | Try different role/location |
| `CSRF check failed` | Using wrong endpoint | Use `/sales-api/salesApiEntities` |
| Proxy timeout | Bad proxy | Verify Decodo credentials |

---

## Headers Needed

```javascript
{
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Cookie': 'li_at=...; li_a=...',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': 'https://www.linkedin.com/sales/search/people'
}
```

---

## Cookies Explained

- **`li_at`** — LinkedIn auth token (expires ~24h)
- **`li_a`** — Sales Navigator token (expires ~7-30 days)
- **`JSESSIONID`** — Session ID (optional, auto-refreshed)

**How to get:**
1. Open Chrome DevTools
2. Go to linkedin.com/sales/search/people
3. Application → Cookies → Copy `li_at` and `li_a`
4. Paste into `config/sessions.json`

---

## Rate Limits

- **Per IP:** ~10-20 requests/minute
- **Per account:** ~50-100 requests/hour
- **Recommendation:** 1 request every 5-10 seconds

Use Decodo proxy to rotate IPs and increase throughput.

---

## Performance

| Operation | Time |
|-----------|------|
| Single API call | 2-4s |
| Decision maker filtering | <100ms |
| Proxy + network latency | ~500ms-1s |
| Total per request | 3-5s |

Parallel requests (7 sources) = ~20-25 seconds total for full scan.

---

## Configuration Checklist

```json
{
  "linkedin": {
    "li_at": "✅ Paste your cookie here",
    "JSESSIONID": "✅ Optional"
  },
  "salesnav": {
    "li_a": "✅ Paste your cookie here",
    "JSESSIONID": "✅ Optional"
  },
  "proxy": {
    "server": "http://proxy-10003.useragent.decodo.com:10003",
    "username": "✅ Your Decodo username",
    "password": "✅ Your Decodo password"
  }
}
```

---

## Files You Need

```
lead-gen-bot/
├── config/sessions.json          ← Update with your cookies
├── scripts/salesnav-scraper.js   ← Main scraper (uses PRIMARY endpoint)
├── test-salesnav-api.js          ← Test script
├── SALES_API_GUIDE.md            ← Full documentation
├── QUICK_REFERENCE.md            ← This file
└── server.js                     ← Run the full API server
```

---

## What's Working

✅ Primary API: `/sales-api/salesApiEntities`  
✅ Fallback API: `/voyager/api/search/hits`  
✅ Decision maker filtering  
✅ Seniority classification  
✅ Graceful error handling  
✅ Proxy rotation support  

## What's NOT Working

❌ Voyager GraphQL (requires CSRF)  
❌ Getting verified emails (use Hunter.io)  
❌ Getting phone numbers (use RocketReach)  
❌ Company hiring signals (no API)  

---

## Next Action

1. Update cookies in `config/sessions.json`
2. Run: `node test-salesnav-api.js`
3. See decision makers extracted
4. Integrate into your pipeline

---

**Questions?** See `SALES_API_GUIDE.md` for full reference.
