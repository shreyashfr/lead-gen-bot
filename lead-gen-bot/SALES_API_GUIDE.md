# Sales Navigator API Guide - Decision Makers

## Overview

This guide documents the **LinkedIn Sales Navigator API** used to extract decision makers (VPs, C-level, Directors, etc.) and target them for B2B sales.

---

## API Endpoints Discovered

### Primary Endpoint: `/sales-api/salesApiEntities`

```
GET https://www.linkedin.com/sales-api/salesApiEntities
?q=VP%20Marketing%20USA
&count=50
&filters=(origin:JOB_SEARCH_PAGE_QUERY_PILLS)
```

**Authentication:** Cookies
- `li_at` — LinkedIn auth token
- `li_a` — Sales Navigator auth token

**Headers:**
```
Accept: application/json, text/javascript, */*; q=0.01
X-Requested-With: XMLHttpRequest
Cache-Control: no-cache
Referer: https://www.linkedin.com/sales/search/people
```

**Response Format:**
```json
{
  "data": {
    "elements": [
      {
        "profileId": "...",
        "displayName": "John Doe",
        "title": "VP Marketing",
        "company": "Acme Corp",
        "location": "San Francisco, CA",
        "publicIdentifier": "johndoe",
        "entityUrn": "urn:li:fsd_profile:...",
        ...
      }
    ]
  }
}
```

---

### Fallback Endpoint: `/voyager/api/search/hits`

```
GET https://www.linkedin.com/voyager/api/search/hits
?keywords=VP%20Marketing%20USA
&count=50
&origin=SALES_NAV_SEARCH_PAGE
```

**Authentication:**
- `li_at` + `li_a` cookies
- NO CSRF token required

**Headers:**
```
Accept: application/vnd.linkedin.normalized+json+2.1
X-Requested-With: XMLHttpRequest
```

---

## Decision Maker Classification

The script **automatically filters for decision makers** based on title patterns:

### Tier 1: Executive (Highest Priority)
- `Chief` / `C-Level` / `CEO` / `CTO` / `CFO` / `CMO`
- `President` / `Co-President`
- `Founder` / `Co-Founder`

### Tier 2: Director Level
- `VP` / `Vice President`
- `Senior Director` / `Director`
- `VP of Engineering` / `VP of Marketing` etc.

### Tier 3: Senior Manager
- `Senior Manager`
- `Head of [Department]`
- `Manager of [Department]`

### Filtered Out: Individual Contributors
- `Engineer` / `Developer` / `Analyst` (without Sr./Lead)
- `Specialist` / `Associate` / `Coordinator`

---

## Usage Example

### Search for decision makers in Marketing

```javascript
const scraper = require('./scripts/salesnav-scraper');

const params = {
  role: 'VP Marketing',      // Title to search
  location: 'USA',           // Geographic focus
  industry: 'tech',          // Industry (optional)
  titles: 'VP Marketing,CMO,Head of Marketing'  // Title variations
};

const leads = await scraper.scrape(params, 20);

leads.forEach(lead => {
  console.log(`${lead.name} | ${lead.title} @ ${lead.company}`);
  console.log(`  Seniority: ${lead.seniority}`);
  console.log(`  URL: ${lead.url}`);
  console.log(`  Decision Maker: ${lead.isDecisionMaker}\n`);
});
```

### Output
```
John Doe | VP Marketing @ Acme Corp
  Seniority: director
  URL: https://linkedin.com/in/johndoe
  Decision Maker: true

Sarah Chen | Director of Marketing @ TechCorp
  Seniority: director
  URL: https://linkedin.com/in/sarahchen
  Decision Maker: true
```

---

## Advanced Filtering

### By Seniority
```javascript
const leads = await scraper.scrape(params, 50);

// Get only executives
const executives = leads.filter(l => l.seniority === 'executive');

// Get directors or above
const seniorLeads = leads.filter(l => 
  ['executive', 'director'].includes(l.seniority)
);
```

### By Company Size
Requires additional enrichment (not in basic scraper)

### By Industry
Use the `industry` parameter in search:
```javascript
const params = {
  role: 'VP Marketing',
  location: 'USA',
  industry: 'Financial Services'
};
```

---

## Data Structure

Each lead returned includes:

```json
{
  "source": "SalesNav",
  "name": "John Doe",
  "title": "VP Marketing",
  "company": "Acme Corp",
  "location": "San Francisco, CA",
  "email": "john.doe@acmecorp.com",
  "url": "https://www.linkedin.com/in/johndoe",
  "hiringFor": "VP Marketing",
  "profileId": "johndoe",
  "isDecisionMaker": true,
  "seniority": "director"
}
```

---

## API Limitations & Gotchas

### 1. **Cookies Expire**
- `li_at` expires every ~24 hours
- `li_a` expires every few days to weeks
- Keep cookies fresh for reliable results

### 2. **Rate Limiting**
- LinkedIn throttles rapid requests from same IP
- Use Decodo proxy to rotate IPs
- Max ~10-20 requests/min from single IP

### 3. **No Email Data**
- LinkedIn doesn't provide verified emails in API
- Emails are PLACEHOLDER: `john.doe@acmecorp.com`
- Use email finder service (RocketReach, Hunter.io) to verify

### 4. **CSRF Protection**
- `/voyager/api/graphql` endpoint requires CSRF token
- Can only get CSRF from browser (client-side rendered)
- Fallback endpoints don't require CSRF

### 5. **JavaScript Detection**
- LinkedIn detects automation and blocks heavily
- Use proxy rotation (Decodo) to avoid blocks
- Add realistic delays between requests

---

## Configuration Example

### `config/sessions.json`
```json
{
  "linkedin": {
    "li_at": "AQEFAREBAAAAABysXW0AAAGdG1jsu...",
    "JSESSIONID": "ajax:2689896008412439311"
  },
  "salesnav": {
    "li_a": "AQEFAREBAAAAABysXW0AAAGdG1jsu...",
    "JSESSIONID": "ajax:2689896008412439311"
  },
  "proxy": {
    "server": "http://proxy-10003.useragent.decodo.com:10003",
    "username": "your_decodo_username",
    "password": "your_decodo_password"
  }
}
```

---

## How to Get Valid Cookies

### Option 1: Manual (Most Reliable)
1. Open Chrome DevTools
2. Login to LinkedIn (linkedin.com)
3. Go to LinkedIn Sales Navigator (linkedin.com/sales/search/people)
4. In DevTools → Application → Cookies
5. Copy `li_at` and `li_a` values
6. Paste into `config/sessions.json`

### Option 2: Automated Browser (Puppeteer)
```javascript
const browser = await puppeteer.launch();
const page = await browser.newPage();
// Login flow
const cookies = await page.cookies();
// Extract li_at and li_a
```

### Option 3: Web Driver (Selenium)
```python
driver.get("https://www.linkedin.com")
# Login
cookies = driver.get_cookies()
li_at = next(c for c in cookies if c['name'] == 'li_at')
```

---

## Testing

### Test the scraper:
```bash
node scripts/test-salesnav.js
```

### Expected output:
```
🔍 Testing Sales Navigator API...
Found 15 decision makers
- VP Marketing @ Tech Corp (Executive)
- Director of Marketing @ SaaS Co (Director)
- CMO @ Enterprise Inc (Executive)
...
✅ Test passed
```

---

## Monitoring & Logging

The scraper logs decisions made:

```
✅ Primary API succeeded
   Extracted 12 decision makers
   Seniority breakdown: 2 executive, 10 director, 8 senior, 5 manager

⚠️ Primary API failed, trying fallback
   Fallback API returned results
   Extracted 10 decision makers

📊 Final count: 10 leads
```

---

## Best Practices

1. **Rotate Proxies** — Use Decodo to avoid IP bans
2. **Batch Requests** — Group 5-10 searches before polling
3. **Monitor Cookies** — Check expiry before scan
4. **Cache Results** — Store decision makers for 24h
5. **Enrich Data** — Use email finder for actual emails
6. **Respect Rate Limits** — Max 1 search/5 seconds per IP
7. **Log Failures** — Monitor API errors for debugging

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `403 Forbidden` | Expired cookies | Update `li_at` and `li_a` |
| `429 Too Many Requests` | Rate limited | Wait or use different proxy |
| `Empty results` | Invalid query | Check role/location format |
| `CSRF check failed` | Using `/graphql` endpoint | Use `/sales-api` endpoint instead |
| `Proxy connection failed` | Bad proxy credentials | Check Decodo username/password |

---

## Future Enhancements

- [ ] Multi-filter API (company size, industry, funding)
- [ ] Email verification via enrichment API
- [ ] Phone number extraction
- [ ] LinkedIn connection status check
- [ ] Recent activity tracking
- [ ] Company hiring signal detection
