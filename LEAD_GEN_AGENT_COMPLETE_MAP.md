# Lead Gen Agent — Complete Skills Map

## Overview

**Lead Gen Agent** (workspace: `/home/ubuntu/.openclaw/workspace-sdr/`) is a **dedicated Telegram bot** for finding and managing B2B sales leads.

**Single Core Skill:** `sdr-automation`
**Two Signal Types:** HIRING + RECENTLY FUNDED
**Four Data Sources:** LinkedIn, YC, Indeed, Wellfound
**Fully isolated** from Content Engine (separate workspace, separate Telegram bot, separate database)

---

## ARCHITECTURE

```
LEAD GEN AGENT (Telegram Bot)
    ↓
DISPATCHER (routes commands)
    ↓
SDR-AUTOMATION (main skill)
├─ SIGNAL: HIRING
│  ├─ SOURCE 1: LinkedIn Jobs + Sales Nav
│  ├─ SOURCE 2: YC Work at a Startup  
│  ├─ SOURCE 3: Indeed
│  └─ SOURCE 4: Wellfound (founders)
│
└─ SIGNAL: RECENTLY FUNDED
   └─ SOURCE: YC public API

Output: leads/latest_leads.json
```

---

## SIGNAL TYPES (2 Total)

### 🟢 SIGNAL 1: HIRING
**Goal:** Find decision-makers (CXO, VP, Director, Owner) at companies **actively hiring**

**Auto-detected when query contains:**
- "hiring for", "hiring", "open roles"
- Job role keywords: SDR, Marketing, Sales, Engineer, PM
- Default if no clear signal

**Example queries:**
- "scan: 15 leads of VP, CXO at FMCG companies in India hiring for marketing"
- "scan: 10 leads of SDRs, Sales Managers hiring at SaaS companies"
- "scan: 20 Director roles at AI companies hiring product managers"

**What it returns:**
- Name, Title, Company, LinkedIn URL
- Email (if available)
- Seniority level (CXO, VP, Director, Owner)
- Source (LinkedIn, YC, Indeed, Wellfound)

---

### 🔵 SIGNAL 2: RECENTLY FUNDED
**Goal:** Find founders/leaders at **recently venture-funded startups**

**Auto-detected when query contains:**
- "recently funded", "funded", "raised"
- "seed", "Series A/B/C"
- "YC", "new startups"
- Keywords: "startups", "founder" (without hiring mention)

**Example queries:**
- "scan: 20 leads of Owners, VP, CXO of recently funded AI companies"
- "scan: 15 CEO, Founder leads at AI startups in US"
- "scan: 25 founders at recently funded fintech startups"

**What it returns:**
- Founder/CEO name, LinkedIn URL
- Company name, funding stage
- Industry, location
- Source (YC only for this signal)

---

## DATA SOURCES (4 Total)

### SOURCE 1: LinkedIn Jobs + Sales Navigator
**Authentication:** ✅ Required (`li_at` + `JSESSIONID`)
**Script:** `step1_fetch_jobs.js` → `step2_salesnav.js`
**Signal:** HIRING only
**Output:** Decision-makers from LinkedIn Jobs + Sales Nav search

**What happens:**
1. LinkedIn Jobs API searches by job title + location
2. Returns: Job IDs, companies, seniority levels
3. Sales Navigator enrichment finds decision-makers at those companies
4. Returns: Name, Title, Company, LinkedIn URL, email (if public)

**Pros:**
- Most comprehensive decision-maker database
- Real hiring signals from jobs posted
- Email addresses often available

**Cons:**
- Requires authentication (cookies expire every 24-30 days)
- Rate limited by LinkedIn
- May trigger automation detection

**Status:** ⏳ Credentials needed (you provided them today)

---

### SOURCE 2: YC Work at a Startup
**Authentication:** ❌ Not required (public data)
**Script:** `step1_yc_jobs.py`
**Signal:** HIRING only
**Output:** Founders hiring through YC job board

**What happens:**
1. Scrapes YC Work at a Startup job board
2. Searches by job title, location, batch
3. Returns founders with LinkedIn URLs
4. Each founder = decision-maker (100% authority)

**Pros:**
- No authentication needed
- Direct access to founders
- 100% decision-making authority
- Fresh job listings

**Cons:**
- Limited to YC-backed companies
- Smaller dataset than LinkedIn
- Job board may be updated infrequently

**Status:** ✅ Working now

---

### SOURCE 3: Indeed
**Authentication:** ❌ Not required (public scraping)
**Script:** `step1_indeed.py`
**Signal:** HIRING only
**Output:** Company LinkedIn URLs from Indeed

**What happens:**
1. Indeed scraping by job title + location
2. Extracts company LinkedIn URLs
3. Optional: Sales Nav enrichment to find decision-makers

**Pros:**
- Large job database
- No authentication needed
- Covers non-tech industries

**Cons:**
- Lower quality than LinkedIn
- Requires Sales Nav for decision-maker enrichment
- May have stale data

**Status:** ✅ Working now

---

### SOURCE 4: Wellfound (AngelList)
**Authentication:** ✅ Required (browser session)
**Script:** `step1_wellfound.py` or `step1_wellfound.js`
**Signal:** HIRING only
**Output:** Founders hiring through AngelList/Wellfound

**What happens:**
1. Scrapes Wellfound job listings
2. Searches by role, location, funding stage
3. Returns founders + their hiring needs
4. Returns LinkedIn URLs

**Pros:**
- Access to early-stage startups
- Direct founder access
- Startup ecosystem focused

**Cons:**
- Requires authentication (separate from LinkedIn)
- Smaller dataset than LinkedIn
- May need regular credential refresh

**Status:** ⚠️ Session storage exists, credentials needed

---

### SOURCE 5: YC Recently Funded (Public API)
**Authentication:** ❌ Not required (public API)
**Script:** `step1_yc.py`
**Signal:** RECENTLY FUNDED only
**Output:** Founders at recently YC-backed companies

**What happens:**
1. YC public API query by industry + batch + region
2. Returns: Company, founder, funding stage, industry
3. Can optionally enrich with LinkedIn URLs
4. Can optionally find decision-makers via Sales Nav

**Pros:**
- 100% verified funding data
- Public API (reliable)
- No authentication needed
- YC brand = quality signal

**Cons:**
- Only YC companies
- Limited to recent batches
- May need LinkedIn enrichment for emails

**Status:** ✅ Working now

---

## CORE PIPELINE SKILLS

### 1. **DISPATCHER** (Entry Point)
**Location:** Built into bot logic
**SKILL.md:** In `/home/ubuntu/.openclaw/workspace-sdr/AGENTS.md`

**Purpose:**
- Receives Telegram message
- Routes to SDR-AUTOMATION
- Handles commands: `scan`, `scan: [query]`, `leads`, `help`, `setup`

**When it runs:**
- Every Telegram message to SDR bot

**Output:**
- Routes to SDR-AUTOMATION skill

---

### 2. **SDR-AUTOMATION** (Main Orchestrator)
**Location:** `/home/ubuntu/.openclaw/workspace-sdr/skills/sdr-automation/`
**SKILL.md:** Yes ✅ (12KB, comprehensive)

**Purpose:**
- Core lead generation engine
- Auto-detects signal type (HIRING vs RECENTLY FUNDED)
- Orchestrates all 4 data sources
- Streams leads to user in real-time
- Logs all leads to database

**5-Step Workflow:**

```
Step 1: MESSAGE USER
├─ "Scanning now..."
├─ "Looking for X leads..."
└─ "Est. time: X mins"

Step 2: DETECT SIGNAL
├─ Parse query
├─ Extract: industry, role, location, seniority
└─ Determine: HIRING or RECENTLY FUNDED

Step 3: RUN SOURCES (Parallel)
├─ If HIRING:
│  ├─ LinkedIn Jobs + Sales Nav
│  ├─ YC Work at a Startup
│  └─ Indeed (+ optional Sales Nav enrichment)
│
└─ If RECENTLY FUNDED:
   └─ YC public API

Step 4: STREAM LEADS
├─ Poll output/streaming/*.json every 15 seconds
├─ Send each lead to user immediately
└─ Mark as .sent after sending

Step 5: FINALIZE
├─ Wait for all sources to complete
├─ Save to leads/latest_leads.json
├─ Log to leads/log.csv
└─ Show summary: "Found X leads"
```

**Files Used:**
- `SKILL.md` — Full documentation
- `scripts/step1_fetch_jobs.js` — LinkedIn Jobs
- `scripts/step2_salesnav.js` — Sales Navigator
- `scripts/step1_yc_jobs.py` — YC Work at Startup
- `scripts/step1_indeed.py` — Indeed scraping
- `scripts/step1_wellfound.py` — Wellfound scraping
- `scripts/step1_yc.py` — YC public API
- `output/streaming/` — Real-time lead stream
- `leads/latest_leads.json` — Latest results
- `leads/log.csv` — All-time log

**When it runs:**
- When user sends: `scan` or `scan: [query]`

**Output:**
- Leads streamed to Telegram (one per message)
- Saved to `leads/latest_leads.json`
- Appended to `leads/log.csv`

---

## DATA FILES & STRUCTURE

### Workspace Structure
```
workspace-sdr/
├── AGENTS.md                    # Bot config
├── SOUL.md                      # Bot purpose
├── USER.md                      # ICP (Ideal Customer Profile)
├── TOOLS.md                     # Tool notes
├── IDENTITY.md                  # Bot identity
├── HEARTBEAT.md                 # Heartbeat config
│
├── auth/
│   ├── linkedin.json            # li_at + JSESSIONID (NEW - YOUR CREDS)
│   └── wellfound.json           # Wellfound session (TBD)
│
├── skills/
│   └── sdr-automation/
│       ├── SKILL.md             # Full documentation
│       ├── scripts/
│       │   ├── step1_fetch_jobs.js       # LinkedIn Jobs
│       │   ├── step2_salesnav.js         # Sales Nav (USES auth/linkedin.json)
│       │   ├── step1_yc_jobs.py          # YC Work at Startup
│       │   ├── step1_yc.py               # YC Recently Funded
│       │   ├── step1_indeed.py           # Indeed
│       │   ├── step1_wellfound.py        # Wellfound
│       │   ├── run_hiring_scan.sh        # Master script for HIRING signal
│       │   └── [other utility scripts]
│       ├── session/
│       │   └── wellfound-chrome/         # Wellfound browser session
│       └── output/
│           └── streaming/                # Real-time lead output
│
├── leads/
│   ├── latest_leads.json        # Most recent scan results
│   ├── log.csv                  # All-time lead log
│   └── raw/                     # Raw data from sources
│
├── memory/
│   └── YYYY-MM-DD.md            # Daily activity logs
│
└── scripts/
    ├── linkedin_login.py        # Manual LinkedIn login
    └── [other utilities]
```

---

## DATA FILE FORMATS

### `auth/linkedin.json` (NEW)
```json
{
  "li_at": "AQEFAREBAAAAABysXW0AAAGdG1jsuQ...",
  "JSESSIONID": "ajax:2689896008412439311",
  "stored_at": "2026-03-24T11:27:00Z",
  "expires_at": "TBD",
  "provider": "LinkedIn",
  "status": "active"
}
```

### `leads/latest_leads.json`
```json
{
  "scan_id": "2026-03-24T11-30-00",
  "query": "10 leads of VP, CXO at SaaS companies hiring for sales",
  "signal": "HIRING",
  "total_leads": 10,
  "leads": [
    {
      "name": "John Doe",
      "title": "VP Sales",
      "company": "TechCorp Inc",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "email": "john@techcorp.com",
      "source": "LinkedIn",
      "seniority": "VP",
      "industry": "SaaS",
      "location": "US",
      "timestamp": "2026-03-24T11:30:15Z"
    },
    ...
  ]
}
```

### `leads/log.csv`
```csv
timestamp,name,title,company,linkedin_url,email,source,signal,seniority,industry
2026-03-24T11:30:15Z,John Doe,VP Sales,TechCorp Inc,https://linkedin.com/in/johndoe,john@techcorp.com,LinkedIn,HIRING,VP,SaaS
2026-03-24T11:30:22Z,Jane Smith,CXO,StartupXYZ,https://linkedin.com/in/janesmith,jane@startupxyz.com,YC,HIRING,CXO,AI
...
```

---

## COMMAND REFERENCE

### HIRING Signal
```bash
# Format: scan: [N] [seniority] at [industry] companies in [location] hiring for [role]

# Examples:
scan: 10 leads of VP, CXO at FMCG companies in India hiring for marketing
scan: 15 SDRs, Sales Directors at SaaS companies in US actively hiring
scan: 20 leaders at fintech companies hiring product managers
```

**Internal command:**
```bash
bash run_hiring_scan.sh \
  --keywords "sales,SDR,account executive" \
  --location "United States" \
  --industry "SaaS" \
  --seniority "OWNER,CXO,VP,DIRECTOR" \
  --max 10
```

### RECENTLY FUNDED Signal
```bash
# Format: scan: [N] [seniority] at [industry] companies that recently raised funds

# Examples:
scan: 20 leads of Owners, VP, CXO of recently funded AI companies
scan: 15 CEO, Founder leads at newly funded fintech startups in US
scan: 25 founders at recently funded SaaS companies
```

**Internal command:**
```bash
python3 step1_yc.py \
  --industry "AI" \
  --batches "X26,W26,F25,S25,W25,S24" \
  --location "America / Canada" \
  --max 20
```

---

## PARAMETER MAPPING

### Industry Mapping (For Queries)
| User Says | Internal Use |
|-----------|--------------|
| AI, artificial intelligence, machine learning | AI, Artificial Intelligence, Generative AI, Machine Learning |
| SaaS, software, B2B | SaaS, B2B |
| Fintech, finance | Fintech |
| Healthtech, health, biotech, medicine | Healthcare, Healthcare IT, Biotech |
| Edtech, education, learning | Education |
| Ecommerce, e-commerce, consumer | E-Commerce, Consumer |
| Devtools, developer, API | Developer Tools, API, Infrastructure |
| Cybersecurity, security | Security |
| HR, recruiter, hiring | HR Tech, Recruiting and Talent |
| Proptech, real estate, construction | Proptech, Real Estate and Construction |

### Seniority Mapping
| User Says | Internal Use |
|-----------|--------------|
| CEO, Founder, Owner, C-suite | OWNER |
| CXO, CTO, CFO, CMO, COO | CXO |
| VP, Head of | VP |
| Director, SVP, EVP, AVP | DIRECTOR |

### Location Mapping
| User Says | YC Region | Filter |
|-----------|-----------|--------|
| US, USA, United States, North America | America / Canada | US-based |
| India, South Asia, Indian | South Asia | India-focused |
| Europe, UK, EU | Europe | Europe-based |
| LATAM, Latin America | Latin America | LATAM-focused |
| Southeast Asia, Singapore, Bangkok | Southeast Asia | SEA-focused |
| Middle East, MENA, Dubai | Middle East and North Africa | MENA-focused |
| Africa | Africa | Africa-focused |
| (none specified) | (all) | Global |

### YC Batches (Newest First)
```
X26 (Winter 2026)
W26 (winter 2026)
F25 (Fall 2025)
S25 (Summer 2025)
W25 (Winter 2025)
F24 (Fall 2024)
S24 (Summer 2024)
W24 (Winter 2024)
...
```

---

## SOURCE PRIORITIZATION (For HIRING Signal)

When running `run_hiring_scan.sh`, sources are split by percentage:

| Source | % | For 10 leads | For 20 leads | For 30 leads |
|--------|---|--------------|--------------|--------------|
| LinkedIn | 50% | 5 | 10 | 15 |
| Indeed | 30% | 3 | 6 | 9 |
| YC | 20% | 2 | 4 | 6 |

**Why this split?**
- LinkedIn: Highest quality, most decision-makers
- Indeed: Broader dataset, covers non-tech
- YC: Direct founder access, highest authority

**Wellfound:** Optional add-on, can be included in split

---

## REAL-TIME STREAMING

### How Leads Reach User

```
Source scripts run in parallel
    ↓
Write to: output/streaming/[source]-[timestamp].json
    ↓
Polling loop every 15 seconds
    ↓
Read all .json files
    ↓
Send each lead to user (one Telegram message)
    ↓
Rename file to .sent
    ↓
Continue until all sources complete + no unsent files
```

### Streaming File Example
```json
{
  "source": "LinkedIn",
  "leads": [
    { "name": "John Doe", "title": "VP Sales", ... },
    { "name": "Jane Smith", "title": "CXO", ... }
  ],
  "timestamp": "2026-03-24T11:30:00Z"
}
```

---

## AUTHENTICATION REQUIREMENTS

### Currently Working
- ✅ YC Work at a Startup (public)
- ✅ YC Recently Funded (public API)
- ✅ Indeed (public scraping)

### Need Credentials (Provided Today)
- ⏳ LinkedIn Jobs + Sales Nav
  - **li_at:** Provided ✅
  - **JSESSIONID:** Provided ✅
  - **Status:** Ready to store

### Need Credentials (Not Yet Provided)
- ⚠️ Wellfound
  - **Session:** Needs setup
  - **Status:** Can be added later

---

## LIMITATIONS & CONSTRAINTS

### LinkedIn
- **Rate limits:** ~1000 requests/day
- **Session expiry:** 24-30 hours
- **Automation detection:** Risk if too aggressive
- **Email availability:** ~40% of profiles

### YC
- **Limited to:** YC-backed companies only
- **Update frequency:** Fresh listings added weekly
- **Data quality:** Very high (verified funding)

### Indeed
- **Data staleness:** Job postings may be old
- **Email availability:** Requires Sales Nav for contact info
- **Coverage:** Broader but less targeted

### Wellfound
- **Limited to:** AngelList-listed companies
- **Session stability:** May need frequent refresh
- **Data quality:** Early-stage focused

---

## WORKFLOW EXAMPLE (End-to-End)

### User sends:
```
scan: 15 leads of VP, CXO at AI companies in US hiring for sales
```

### System processes:
```
Step 1: MESSAGE USER
├─ "🔍 Scanning now..."
├─ "Looking for 15 VP, CXO leads at AI companies hiring for sales"
├─ "🎯 Sources: LinkedIn Jobs + Sales Nav + YC + Indeed"
└─ "📍 Location: United States"

Step 2: DETECT SIGNAL
├─ Contains: "hiring" → HIRING signal ✓
├─ Extract: industry=AI, role=sales, location=US, seniority=VP,CXO
└─ Auto-split: LinkedIn 8, Indeed 4, YC 3

Step 3: RUN 3 SOURCES IN PARALLEL
├─ step1_fetch_jobs.js (LinkedIn) → 8 leads expected
├─ step1_indeed.py (Indeed) → 4 leads expected
└─ step1_yc_jobs.py (YC) → 3 leads expected

Step 4: STREAM LEADS (Real-time)
├─ Poll every 15 sec
├─ LinkedIn returns: John Doe (VP Sales), Jane Smith (CXO), ...
├─ Send to user: "📍 John Doe | VP Sales | TechCorp Inc | linkedin.com/in/johndoe"
├─ Indeed returns: Mark Johnson (Director Sales), ...
├─ Send to user: "📍 Mark Johnson | Director Sales | StartupXYZ | ..."
└─ YC returns: Sarah Chen (Founder/CEO), ...

Step 5: FINALIZE
├─ All sources complete
├─ Save 15 leads to latest_leads.json
├─ Append 15 records to log.csv
└─ Send summary: "✅ Found 15 leads. Ready for outreach!"
```

---

## SUMMARY TABLE

| Component | Type | Status | Files |
|-----------|------|--------|-------|
| **Dispatcher** | Core | ✅ Working | AGENTS.md |
| **SDR-AUTOMATION** | Skill | ✅ Working | SKILL.md + scripts/ |
| **LinkedIn Jobs + Sales Nav** | Source | ⏳ Creds ready | step1_fetch_jobs.js + step2_salesnav.js |
| **YC Work at Startup** | Source | ✅ Working | step1_yc_jobs.py |
| **Indeed** | Source | ✅ Working | step1_indeed.py |
| **Wellfound** | Source | ⚠️ Needs creds | step1_wellfound.py |
| **YC Recently Funded** | Source | ✅ Working | step1_yc.py |
| **HIRING Signal** | Logic | ✅ Working | run_hiring_scan.sh |
| **RECENTLY FUNDED Signal** | Logic | ✅ Working | step1_yc.py |
| **Lead Storage** | DB | ✅ Working | leads/latest_leads.json, log.csv |
| **Authentication** | Config | ⏳ Needs setup | auth/linkedin.json |

---

## Next Steps

1. **Store LinkedIn credentials**
   ```bash
   cat > /home/ubuntu/.openclaw/workspace-sdr/auth/linkedin.json << 'EOF'
   {
     "li_at": "AQEFAREBAAAAABysXW0...",
     "JSESSIONID": "ajax:2689896008412439311",
     "stored_at": "2026-03-24T11:27:00Z",
     "status": "active"
   }
   EOF
   ```

2. **Test LinkedIn authentication**
   ```bash
   DISPLAY=:99 node step2_salesnav.js --limit 5 --target 3 --start 0 --seniority "CXO"
   ```

3. **Run test scan**
   ```bash
   bash run_hiring_scan.sh --keywords "sales" --location "United States" --industry "AI" --seniority "VP,CXO" --max 5
   ```

4. **Monitor output**
   - Check `leads/latest_leads.json` for results
   - Check `leads/log.csv` for all-time history
   - Verify Telegram messages sending properly

---

## Files Summary

**Configuration:**
- `AGENTS.md` — Bot routing
- `SOUL.md` — Bot purpose
- `USER.md` — ICP definition
- `IDENTITY.md` — Bot identity

**Core Skill:**
- `skills/sdr-automation/SKILL.md` — Full documentation (12KB)

**Scripts (7 sources + utilities):**
- `step1_fetch_jobs.js` — LinkedIn Jobs
- `step2_salesnav.js` — Sales Navigator (uses auth/linkedin.json)
- `step1_yc_jobs.py` — YC Work at Startup
- `step1_yc.py` — YC Recently Funded
- `step1_indeed.py` — Indeed
- `step1_wellfound.py` — Wellfound
- `run_hiring_scan.sh` — Master orchestrator for HIRING

**Data:**
- `auth/linkedin.json` — LinkedIn session (NEW)
- `leads/latest_leads.json` — Latest scan results
- `leads/log.csv` — All-time lead log
- `output/streaming/` — Real-time lead stream

**Memory:**
- `memory/YYYY-MM-DD.md` — Daily logs

