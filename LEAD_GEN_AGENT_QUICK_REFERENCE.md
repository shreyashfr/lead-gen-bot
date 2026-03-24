# Lead Gen Agent — Quick Reference Guide

## 🎯 The System at a Glance

**What:** Telegram bot that finds B2B sales leads
**Where:** `/home/ubuntu/.openclaw/workspace-sdr/`
**How:** 2 signals × 5 data sources (parallel execution)
**Output:** Real-time lead stream + CSV log

---

## 2 SIGNAL TYPES

### 🟢 HIRING Signal
**Goal:** Find decision-makers at companies **actively hiring**

**Query pattern:** `scan: [N] [seniority] at [industry] companies [in location] hiring for [role]`

**Example:** 
```
scan: 15 leads of VP, CXO at SaaS companies in US hiring for sales
```

**Sources used (in parallel):**
1. LinkedIn Jobs + Sales Nav (50%)
2. Indeed (30%)
3. YC Work at a Startup (20%)

**What you get:**
- Name, Title, Company
- LinkedIn URL, Email
- Seniority level

---

### 🔵 RECENTLY FUNDED Signal
**Goal:** Find founders at **venture-funded startups**

**Query pattern:** `scan: [N] [seniority] at [industry] companies recently funded`

**Example:**
```
scan: 20 leads of Owners, CXO at recently funded AI companies
```

**Sources used:**
1. YC public API (100%)

**What you get:**
- Founder/CEO name, LinkedIn URL
- Company, funding stage
- Industry, location

---

## 5 DATA SOURCES

| # | Source | Signal | Auth | Status |
|---|--------|--------|------|--------|
| 1 | **LinkedIn Jobs + Sales Nav** | HIRING | ✅ Need li_at + JSESSIONID | ⏳ Creds provided today |
| 2 | **Indeed** | HIRING | ❌ None | ✅ Working |
| 3 | **YC Work at a Startup** | HIRING | ❌ None | ✅ Working |
| 4 | **Wellfound** | HIRING | ✅ Need session | ⚠️ Later |
| 5 | **YC Recently Funded** | RECENTLY FUNDED | ❌ None | ✅ Working |

---

## THE PIPELINE (5 Steps)

```
User: "scan: 15 leads of VP at SaaS hiring"
    ↓
STEP 1: MESSAGE USER
├─ "🔍 Scanning now..."
├─ "Looking for 15 VP leads at SaaS companies..."
└─ "⏱ Est. time: 10 mins"
    ↓
STEP 2: DETECT SIGNAL
├─ Parse: "hiring" → HIRING signal
├─ Extract: industry=SaaS, role=unspecified, seniority=VP
└─ Set sources: LinkedIn 8, Indeed 4, YC 3
    ↓
STEP 3: RUN SOURCES (Parallel)
├─ LinkedIn Jobs + Sales Nav
├─ Indeed scraping
└─ YC Work at Startup scraping
    ↓
STEP 4: STREAM LEADS (Real-time)
├─ Poll output/streaming/ every 15 sec
├─ Send each lead to Telegram (one message)
└─ Mark as .sent
    ↓
STEP 5: FINALIZE
├─ Wait for all sources
├─ Save to leads/latest_leads.json
├─ Append to leads/log.csv
└─ Show summary: "✅ Found 15 leads"
```

---

## COMMANDS (User-Facing)

```bash
# HIRING Signal
scan: 10 leads of VP, CXO at SaaS companies in US hiring for sales
scan: 15 SDRs at fintech companies hiring
scan: 20 directors at AI startups looking for engineers

# RECENTLY FUNDED Signal
scan: 15 leads at recently funded AI companies
scan: 20 founders at newly funded fintech startups in India
scan: 25 CEO, CXO at recently funded companies

# Other commands
leads                   # Show latest scan results
help                    # Show all commands
scan                    # Simple scan (uses ICP from USER.md)
```

---

## SKILL: SDR-AUTOMATION

**Location:** `/home/ubuntu/.openclaw/workspace-sdr/skills/sdr-automation/`

**Files:**
- `SKILL.md` — Full documentation (12KB)
- `scripts/step1_fetch_jobs.js` — LinkedIn Jobs API
- `scripts/step2_salesnav.js` — Sales Navigator (requires auth/linkedin.json)
- `scripts/step1_yc_jobs.py` — YC Work at a Startup
- `scripts/step1_yc.py` — YC Recently Funded API
- `scripts/step1_indeed.py` — Indeed scraping
- `scripts/step1_wellfound.py` — Wellfound scraping
- `scripts/run_hiring_scan.sh` — Master script for HIRING signal
- `output/streaming/` — Real-time lead output

---

## DATA FILES

### Configuration
```
auth/
├── linkedin.json        ← li_at + JSESSIONID (STORE YOUR CREDS HERE)
└── wellfound.json       ← Wellfound session (optional)
```

### Results
```
leads/
├── latest_leads.json    ← Last scan results (JSON)
├── log.csv              ← All-time lead history (CSV)
└── raw/                 ← Raw source outputs
```

### Real-time
```
output/
└── streaming/           ← Live lead stream during scan
    ├── linkedin-*.json
    ├── indeed-*.json
    ├── yc-*.json
    └── [source]-*.sent  ← After sending to user
```

---

## LEAD DATA FORMAT

```json
{
  "name": "John Doe",
  "title": "VP Sales",
  "company": "TechCorp Inc",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "email": "john@techcorp.com",
  "source": "LinkedIn",
  "signal": "HIRING",
  "seniority": "VP",
  "industry": "SaaS",
  "location": "United States",
  "timestamp": "2026-03-24T11:30:15Z"
}
```

---

## PARAMETER QUICK MAP

### Industries
```
AI → AI, Artificial Intelligence, Generative AI, Machine Learning
SaaS → SaaS, B2B
Fintech → Fintech
Healthtech → Healthcare, Healthcare IT, Biotech
Edtech → Education
Ecommerce → E-Commerce, Consumer
Devtools → Developer Tools, API, Infrastructure
Security → Security
HR → HR Tech, Recruiting and Talent
```

### Seniority
```
CEO, Founder, Owner → OWNER
CXO (CTO, CFO, CMO) → CXO
VP, Head of → VP
Director, SVP → DIRECTOR
```

### Locations
```
US, USA, United States → America / Canada
India → South Asia
Europe → Europe
LATAM → Latin America
Southeast Asia → Southeast Asia
```

---

## AUTHENTICATION STATUS

### Working ✅
- YC Work at a Startup
- YC Recently Funded
- Indeed

### Ready to Activate ⏳ (You provided credentials today)
- LinkedIn Jobs + Sales Nav
  - li_at ✅
  - JSESSIONID ✅

### Need to Setup ⚠️ (Later)
- Wellfound

---

## SETUP CHECKLIST

- [ ] Store LinkedIn credentials in `auth/linkedin.json`
- [ ] Test Sales Nav with: `DISPLAY=:99 node step2_salesnav.js --limit 5 --seniority CXO`
- [ ] Run test scan: `bash run_hiring_scan.sh --keywords sales --location "United States" --industry AI --max 5`
- [ ] Verify leads in `leads/latest_leads.json`
- [ ] Check Telegram message streaming works
- [ ] Confirm `leads/log.csv` updates
- [ ] Ready for production!

---

## WORKFLOW (Real Example)

### User says:
```
scan: 10 VP, CXO at AI companies in US hiring for head of sales
```

### System does:
```
MESSAGE: "🔍 Scanning now... Looking for 10 VP, CXO leads at AI companies hiring"

SIGNAL DETECTION: HIRING (contains "hiring")
EXTRACTION: industry=AI, role=sales, location=US, seniority=VP/CXO

SOURCES:
├─ LinkedIn (5 expected): fetch jobs + find decision-makers
├─ Indeed (3 expected): scrape job listings + company data
└─ YC (2 expected): search YC work at startup board

STREAMING:
├─ Lead 1: "📍 John Doe | VP Sales | TechCorp Inc | ..."
├─ Lead 2: "📍 Jane Smith | CXO | StartupXYZ | ..."
├─ Lead 3: "📍 Mark Johnson | VP | FintechCo | ..."
└─ ... 7 more

SAVE:
├─ latest_leads.json: 10 leads
├─ log.csv: +10 rows
└─ Summary: "✅ Found 10 leads. Ready for outreach!"
```

---

## TROUBLESHOOTING

### "LinkedIn authentication failed"
→ JSESSIONID expired (24hr cookie)
→ Get new li_at + JSESSIONID from LinkedIn
→ Update `/home/ubuntu/.openclaw/workspace-sdr/auth/linkedin.json`

### "Only 2-3 leads found"
→ Industry/role mismatch
→ LinkedIn source might be struggling with query
→ Try simpler keywords

### "YC Work at a Startup returns nothing"
→ No open roles matching criteria
→ Try broader industry or different batch

### "Indeed returns company URLs but no names"
→ Need Sales Nav to enrich
→ Make sure LinkedIn session is active

---

## FILES SUMMARY

**Bot Config:**
- `AGENTS.md` — Routes commands
- `SOUL.md` — Bot identity
- `USER.md` — ICP definition
- `IDENTITY.md` — Bot profile

**Core Skill:**
- `skills/sdr-automation/SKILL.md` — Everything

**Scripts (Sources):**
- `step1_fetch_jobs.js` — LinkedIn Jobs
- `step2_salesnav.js` — Sales Nav (uses auth/linkedin.json)
- `step1_indeed.py` — Indeed
- `step1_yc_jobs.py` — YC Work at Startup
- `step1_yc.py` — YC Recently Funded
- `step1_wellfound.py` — Wellfound
- `run_hiring_scan.sh` — HIRING orchestrator

**Data:**
- `auth/linkedin.json` — Your LinkedIn session
- `leads/latest_leads.json` — Latest results
- `leads/log.csv` — All-time log
- `output/streaming/` — Real-time stream

**Memory:**
- `memory/YYYY-MM-DD.md` — Daily logs

---

## NEXT ACTION

**Ready to activate LinkedIn:**

```bash
# 1. Store credentials
cat > /home/ubuntu/.openclaw/workspace-sdr/auth/linkedin.json << 'EOF'
{
  "li_at": "AQEFAREBAAAAABysXW0...",
  "JSESSIONID": "ajax:2689896008412439311",
  "stored_at": "2026-03-24T11:27:00Z",
  "status": "active"
}
EOF

# 2. Test
DISPLAY=:99 node /home/ubuntu/.openclaw/workspace-sdr/skills/sdr-automation/scripts/step2_salesnav.js --limit 5 --seniority CXO

# 3. Run test scan
bash /home/ubuntu/.openclaw/workspace-sdr/skills/sdr-automation/scripts/run_hiring_scan.sh \
  --keywords "sales" \
  --location "United States" \
  --industry "AI" \
  --seniority "VP,CXO" \
  --max 10

# 4. Check results
cat /home/ubuntu/.openclaw/workspace-sdr/leads/latest_leads.json
```

**Ready?** ✅

