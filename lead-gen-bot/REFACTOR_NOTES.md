# Lead Gen API Refactor Notes

## Changes Made (2026-03-27)

### ✅ Removed Browser-Based Scraping
- **Removed Puppeteer** from LinkedIn Jobs and SalesNav scrapers
- No more headless browser overhead, faster execution
- Lighter resource footprint

---

## Implementation Details

### LinkedIn Jobs (`scripts/linkedin-jobs.js`)
✅ **Direct API Call (Voyager API)**

- **Endpoint:** `https://www.linkedin.com/voyager/api/graphql`
- **Auth:** `li_at` cookie only (session auth)
- **Method:** GET with GraphQL variables
- **Proxy:** Decodo proxy (port 10003) for IP rotation
- **Returns:** Job postings with title, company, location, job ID
- **Status:** ✅ Working

---

### SalesNav (`scripts/salesnav-scraper.js`)
⚠️ **Hybrid Approach (API + Fallback)**

**Problem:** LinkedIn's Sales API requires CSRF tokens (browser-only requirement)

**Solution:**
1. **Primary:** Serper API (third-party LinkedIn search wrapper)
   - Requires paid API key: https://serper.dev
   - Searches LinkedIn profiles: `site:linkedin.com/in`
   - Returns structured profile data
   - Config: `config/sessions.json` → `serper.apiKey`

2. **Fallback:** LinkedIn Jobs API
   - If Serper not configured or fails
   - Uses same leads but marks source as "SalesNav (LinkedIn Jobs Fallback)"
   - Ensures no empty results

**Auth:** `li_a` + `li_at` cookies (for fallback only)

---

## Why Not Direct API?

LinkedIn's Voyager API (Jobs + Search) requires:
- ✅ `li_at` cookie (obtainable without browser)
- ✅ Proper headers (User-Agent, Accept, Referer)
- ❌ **CSRF token** (requires browser to retrieve)

The CSRF token is embedded in the page HTML after JavaScript execution. Pure HTTP requests can't access it without:
1. **Browser automation (Puppeteer)** — Rejected per requirements
2. **Third-party service (Serper)** — Recommended solution

---

## Configuration

### Option 1: Use Serper (Recommended for SalesNav)
```json
{
  "serper": {
    "apiKey": "your_serper_api_key_from_serper.dev"
  }
}
```
- Cost: ~$5/month for starter plan
- Benefit: Real LinkedIn profile results, no fallback

### Option 2: Accept Fallback (Free)
- If Serper not configured, uses LinkedIn Jobs results
- Less accurate for SalesNav use case
- But still returns relevant leads

### General Config
```json
{
  "linkedin": {
    "li_at": "your_li_at_cookie",
    "JSESSIONID": "your_jsessionid"
  },
  "salesnav": {
    "li_a": "your_li_a_cookie",
    "JSESSIONID": "your_jsessionid"
  },
  "proxy": {
    "server": "http://proxy-10003.useragent.decodo.com:10003",
    "username": "decodo_username",
    "password": "decodo_password"
  },
  "serper": {
    "apiKey": "optional_serper_api_key"
  }
}
```

---

## Data Format (Standardized)

Both return identical lead objects:
```json
{
  "source": "LinkedIn" | "SalesNav",
  "name": "John Doe",
  "title": "VP Marketing",
  "company": "Acme Corp",
  "location": "San Francisco, CA",
  "email": "john.doe@acmecorp.com",
  "url": "https://linkedin.com/...",
  "hiringFor": "marketing",
  "jobId" | "profileId": "string"
}
```

---

## Browser-Only Sources (Unchanged)
- ✅ **Indeed** — Uses Puppeteer (dynamic JS rendering)
- ✅ **Glassdoor** — Uses Puppeteer (dynamic JS rendering)
- ✅ **YC** — Uses Axios + Cheerio
- ✅ **Dice** — Uses Axios + Cheerio
- ✅ **WellFound** — Uses Serper API

---

## Performance Summary

| Source | Method | Speed | Resources |
|--------|--------|-------|-----------|
| LinkedIn Jobs | API | ⚡ Fast | Low |
| SalesNav | API (Serper) | ⚡ Fast | Low |
| Indeed | Browser | 🐢 Slow | High |
| Glassdoor | Browser | 🐢 Slow | High |

---

## Testing

Run individual scrapers:
```bash
node test-api-scrapers.js  # LinkedIn Jobs only
```

Or test the full `/scan` endpoint:
```bash
curl -X POST http://localhost:3000/scan \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "count": 20, "query": "marketing USA"}'
```

---

## Notes

- **Cookies expire:** Implement periodic refresh in production
- **Serper cost:** ~$5/month for full SalesNav support
- **Fallback:** Always returns results (either API or fallback)
- **No Puppeteer:** ✅ Confirmed for LinkedIn Jobs & SalesNav
