# Lead Gen Bot - All Sources Brief

**Date:** 2026-03-27  
**Status:** Testing all 7 sources with new API methods  

---

## 📊 Sources Overview

| # | Source | Method | Auth | Status | Speed |
|---|--------|--------|------|--------|-------|
| 1 | **LinkedIn Jobs** | Voyager API | `li_at` | ✅ NEW | ⚡ 2-4s |
| 2 | **SalesNav** | Sales API | `li_a` | ✅ NEW | ⚡ 3-5s |
| 3 | **Indeed** | Puppeteer | None | ✅ Browser | 🐢 10-20s |
| 4 | **Glassdoor** | Puppeteer | None | ✅ Browser | 🐢 10-20s |
| 5 | **YC** | Axios + Cheerio | None | ✅ HTML | ⚡ 2-5s |
| 6 | **Dice** | Axios + Cheerio | None | ✅ HTML | ⚡ 2-5s |
| 7 | **WellFound** | Serper API | API Key | ✅ Third-party | ⚡ 3-5s |

---

## 1️⃣ LinkedIn Jobs

**File:** `scripts/linkedin-jobs.js`

### Method
- **Endpoint:** `/voyager/api/graphql`
- **Auth:** `li_at` cookie only
- **Type:** Direct API call (HTTP GET)
- **Proxy:** Required (Decodo)

### What it does
- Searches for job postings on LinkedIn
- Returns: title, company, location, job ID
- Filters by keywords (role, location)
- No browser needed

### Configuration
```json
{
  "linkedin": {
    "li_at": "YOUR_COOKIE"
  },
  "proxy": { ... }
}
```

### Expected Output
```json
{
  "source": "LinkedIn",
  "name": "VP Marketing @ Acme Corp",
  "title": "VP Marketing",
  "company": "Acme Corp",
  "location": "San Francisco, CA",
  "url": "https://linkedin.com/jobs/view/123",
  "hiringFor": "marketing",
  "jobId": "123"
}
```

### Performance
- **Time:** 2-4 seconds
- **Leads/request:** Up to 50
- **Rate limit:** ~10-20 req/min per IP

---

## 2️⃣ Sales Navigator

**File:** `scripts/salesnav-scraper.js`

### Method
- **Primary:** `/sales-api/salesApiEntities`
- **Fallback:** `/voyager/api/search/hits`
- **Auth:** `li_a` + `li_at` cookies
- **Type:** Direct API call (HTTP GET)
- **Proxy:** Required

### What it does
- Searches for decision makers (VPs, C-level, Directors)
- Auto-filters by seniority level
- Returns: name, title, company, location, profile ID
- Smart decision maker classification

### Configuration
```json
{
  "linkedin": { "li_at": "..." },
  "salesnav": { "li_a": "..." },
  "proxy": { ... }
}
```

### Expected Output
```json
{
  "source": "SalesNav",
  "name": "John Doe",
  "title": "VP Marketing",
  "company": "Acme Corp",
  "location": "San Francisco, CA",
  "url": "https://linkedin.com/in/johndoe",
  "profileId": "johndoe",
  "isDecisionMaker": true,
  "seniority": "director"
}
```

### Performance
- **Time:** 3-5 seconds
- **Leads/request:** Up to 50
- **Decision Makers:** ~50-60% of results

---

## 3️⃣ Indeed

**File:** `scripts/indeed-scraper.js`

### Method
- **Type:** Puppeteer (headless browser)
- **Auth:** None (public job board)
- **Rendering:** Full JavaScript execution
- **Proxy:** Required

### What it does
- Scrapes Indeed job listings
- Handles dynamic JavaScript rendering
- Returns: job title, company, location, salary (when available)
- Extracts from job cards

### Configuration
```json
{
  "proxy": {
    "server": "http://proxy-10003...",
    "username": "...",
    "password": "..."
  }
}
```

### Expected Output
```json
{
  "source": "Indeed",
  "name": "Marketing Manager @ XYZ Corp",
  "title": "Marketing Manager",
  "company": "XYZ Corp",
  "location": "New York, NY",
  "salary": "$80,000 - $120,000",
  "url": "https://indeed.com/jobs?jk=...",
  "email": "jobs@xyzcorp.com"
}
```

### Performance
- **Time:** 10-20 seconds (browser overhead)
- **Leads/request:** Up to 50
- **Render wait:** 5-10s for JS

---

## 4️⃣ Glassdoor

**File:** `scripts/glassdoor-scraper.js`

### Method
- **Type:** Puppeteer (headless browser)
- **Auth:** Cookies (optional)
- **Rendering:** Full JavaScript + cookies
- **Proxy:** Required

### What it does
- Scrapes Glassdoor job postings
- Uses company-specific cookies for auth
- Returns: job title, company, salary, benefits
- Extracts company info

### Configuration
```json
{
  "glassdoor": {
    "cookies": [
      { "name": "GDAT", "value": "..." },
      { "name": "JSESSIONID", "value": "..." }
    ]
  },
  "proxy": { ... }
}
```

### Expected Output
```json
{
  "source": "Glassdoor",
  "name": "Senior Marketing @ TechCorp",
  "title": "Senior Marketing",
  "company": "TechCorp",
  "location": "San Francisco, CA",
  "salary": "$120,000 - $150,000",
  "url": "https://glassdoor.com/job/...",
  "email": "careers@techcorp.com"
}
```

### Performance
- **Time:** 10-20 seconds
- **Leads/request:** Up to 30
- **Cookie handling:** 2-3s

---

## 5️⃣ Y Combinator

**File:** `scripts/yc-scraper.js`

### Method
- **Type:** Axios + Cheerio (static HTML)
- **Auth:** None
- **Rendering:** Simple HTTP + HTML parsing
- **Proxy:** Required

### What it does
- Scrapes YC companies job listings
- Parses company directories
- Returns: startup name, title, location, URL
- Focus on early-stage companies

### Configuration
```json
{
  "proxy": { ... }
}
```

### Expected Output
```json
{
  "source": "YC",
  "name": "VP Marketing @ TechStartup (YC)",
  "title": "VP Marketing",
  "company": "TechStartup",
  "location": "San Francisco, CA",
  "url": "https://ycombinator.com/companies/...",
  "email": "jobs@techstartup.com"
}
```

### Performance
- **Time:** 2-5 seconds
- **Leads/request:** Up to 50
- **No rendering:** Very fast

---

## 6️⃣ Dice

**File:** `scripts/dice-scraper.js`

### Method
- **Type:** Axios + Cheerio (static HTML)
- **Auth:** None
- **Rendering:** Simple HTTP + HTML parsing
- **Proxy:** Required

### What it does
- Scrapes Dice (tech job board)
- Targets tech/engineering roles
- Returns: job title, company, salary, location
- Tech-focused results

### Configuration
```json
{
  "proxy": { ... }
}
```

### Expected Output
```json
{
  "source": "Dice",
  "name": "Engineering Manager @ DevCorp",
  "title": "Engineering Manager",
  "company": "DevCorp",
  "location": "Austin, TX",
  "salary": "$100,000 - $130,000",
  "url": "https://dice.com/jobs/...",
  "email": "hiring@devcorp.com"
}
```

### Performance
- **Time:** 2-5 seconds
- **Leads/request:** Up to 50
- **No rendering:** Very fast

---

## 7️⃣ WellFound

**File:** `scripts/wellfound-serper.js`

### Method
- **Type:** Serper API (third-party search)
- **Auth:** API Key required
- **Rendering:** None (API)
- **Proxy:** Not needed

### What it does
- Searches WellFound (Startup job board)
- Uses Serper search API
- Returns: startup jobs, co-founder matching
- Focus on early-stage/startup funding

### Configuration
```json
{
  "serper": {
    "apiKey": "YOUR_SERPER_KEY"
  }
}
```

### Expected Output
```json
{
  "source": "WellFound",
  "name": "VP Engineering @ Series B Startup",
  "title": "VP Engineering",
  "company": "Series B Startup",
  "location": "San Francisco, CA",
  "fundingStage": "Series B",
  "url": "https://wellfound.com/...",
  "email": "hiring@startup.com"
}
```

### Performance
- **Time:** 3-5 seconds
- **Leads/request:** Up to 50
- **API:** Very reliable

---

## 📋 Standardized Output Format

All sources return leads in this format:

```javascript
{
  source: "SourceName",              // Which scraper
  name: "Title @ Company",           // Display name
  title: "Job Title",                // Position title
  company: "Company Name",           // Company
  location: "City, State",           // Location
  email: "placeholder@company.com",  // Placeholder (verify with enrichment)
  url: "https://...",                // Link to profile/job
  hiringFor: "marketing",            // Search role
  jobId | profileId: "123"           // Source-specific ID
}
```

---

## 🧪 Test Results Format

Each test will show:
- ✅ Status (working/failed)
- 📊 Leads returned
- ⏱️ Response time
- 🔗 Sample lead
- ⚠️ Errors (if any)

---

## 🚀 How They Work Together

```
User Request (role: "VP Marketing", location: "USA", count: 50)
    ↓
7 Scrapers Run in PARALLEL (Promise.allSettled)
    ├─ LinkedIn Jobs (2-4s)
    ├─ SalesNav (3-5s)
    ├─ Indeed (10-20s)
    ├─ Glassdoor (10-20s)
    ├─ YC (2-5s)
    ├─ Dice (2-5s)
    └─ WellFound (3-5s)
    ↓
Aggregate Results (~20-25s total)
    ↓
Limit to requested count (50)
    ↓
Return: 50 leads from mixed sources
```

---

## 📈 Expected Coverage

| Source | Total Leads | Decision Makers | % |
|--------|------------|-----------------|---|
| LinkedIn Jobs | 7-8 | 1-2 | 14-25% |
| SalesNav | 7-8 | 7-8 | 100% |
| Indeed | 7-8 | 1-2 | 14-25% |
| Glassdoor | 7-8 | 1-2 | 14-25% |
| YC | 7-8 | 3-4 | 43-50% |
| Dice | 7-8 | 2-3 | 25-40% |
| WellFound | 7-8 | 4-5 | 50-62% |
| **Total** | **~50** | **~20** | **~40%** |

---

## ✅ Configuration Checklist

```json
{
  "linkedin": {
    "li_at": "✅ REQUIRED"
  },
  "salesnav": {
    "li_a": "✅ REQUIRED"
  },
  "proxy": {
    "server": "✅ REQUIRED",
    "username": "✅ REQUIRED",
    "password": "✅ REQUIRED"
  },
  "serper": {
    "apiKey": "⚠️ OPTIONAL (for WellFound)"
  },
  "glassdoor": {
    "cookies": "⚠️ OPTIONAL"
  }
}
```

---

## 🎯 When to Use Each

| Goal | Use |
|------|-----|
| **Find decision makers** | SalesNav + LinkedIn Jobs |
| **Startup roles** | YC + WellFound |
| **Tech jobs** | Dice + Indeed |
| **Comprehensive search** | All 7 (parallel) |
| **Fast results** | LinkedIn Jobs + YC + Dice (~5s) |
| **High quality** | SalesNav (auto-filtered) |

---

**Next:** Run all tests with `node test-all-sources.js`
