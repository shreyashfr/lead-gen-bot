# Lead Gen Agent — Signal-Based Reorganization Plan

## Current Problem

**All scripts mixed together:**
```
scripts/
├── step1_fetch_jobs.js       ← Signal 1
├── step2_salesnav.js         ← Signal 1 (but also reused in Signal 2 optionally?)
├── step1_indeed.py           ← Signal 1
├── step1_yc_jobs.py          ← Signal 1
├── step1_yc.py               ← Signal 2
├── step1_wellfound.py        ← Signal 1
└── [mixed with utilities]
```

**Issues:**
- ❌ Unclear which scripts belong to which signal
- ❌ step2_salesnav.js is shared/duplicated logic
- ❌ No clear signal-specific workflow
- ❌ Hard to track which sources run for which signal

---

## Target Structure (Signal-Based Organization)

```
sdr-automation/
├── SKILL.md                          ← Main orchestrator logic

├── signals/
│   ├── SIGNAL_1_HIRING.md            ← All hiring logic & steps
│   └── SIGNAL_2_RECENTLY_FUNDED.md   ← All funded logic & steps
│
├── scripts/
│   ├── common/
│   │   └── salesnav.js               ← Shared Sales Nav enrichment
│   │
│   ├── signal_1_hiring/
│   │   ├── run_signal_1.sh           ← Master orchestrator for Signal 1
│   │   ├── step1_linkedin_jobs.js
│   │   ├── step1_indeed.py
│   │   ├── step1_yc_jobs.py
│   │   └── step1_wellfound.py
│   │
│   └── signal_2_funded/
│       ├── run_signal_2.sh           ← Master orchestrator for Signal 2
│       └── step1_yc.py
│
├── output/
│   ├── streaming/                    ← Real-time leads during scan
│   ├── signal_1/                     ← Signal 1 results
│   └── signal_2/                     ← Signal 2 results
│
└── [auth, leads, memory, etc.]
```

---

## Reorganization Steps

### Step 1: Create Signal Documentation Files

**`signals/SIGNAL_1_HIRING.md`**
```markdown
# SIGNAL 1: HIRING — Decision-Makers at Hiring Companies

## What This Signal Does
Find VP, CXO, Director, Owner at companies actively recruiting.

## When Detected
Query contains: "hiring", "open roles", job titles (SDR, Sales, Engineer, etc.)

## Sources (4 Total)
1. LinkedIn Jobs + Sales Nav enrichment (50%)
2. Indeed (30%)
3. YC Work at a Startup (20%)
4. Wellfound (optional)

## Execution Flow
1. User sends: "scan: 15 leads of VP at SaaS hiring"
2. System reads this file
3. Run: run_signal_1.sh with parameters
4. Scripts return: decision-makers with LinkedIn URLs

## Scripts Used
- scripts/signal_1_hiring/step1_linkedin_jobs.js
- scripts/common/salesnav.js (enrichment)
- scripts/signal_1_hiring/step1_indeed.py
- scripts/signal_1_hiring/step1_yc_jobs.py
- scripts/signal_1_hiring/step1_wellfound.py (optional)

## Output Format
```json
{
  "source": "LinkedIn",
  "leads": [
    {
      "name": "John Doe",
      "title": "VP Sales",
      "company": "TechCorp",
      "linkedin_url": "...",
      "email": "...",
      "seniority": "VP"
    }
  ]
}
```

## Parameters
--keywords (job titles) | --location (geo) | --seniority (OWNER,CXO,VP,DIRECTOR) | --max (N)
```

**`signals/SIGNAL_2_RECENTLY_FUNDED.md`**
```markdown
# SIGNAL 2: RECENTLY FUNDED — Founders at VC-Backed Startups

## What This Signal Does
Find founders/CEOs at companies that recently raised venture funding.

## When Detected
Query contains: "recently funded", "raised", "seed", "Series", "YC", "startup"

## Sources (1 Total)
1. YC Public API + Company page scrape (100%)

## Execution Flow
1. User sends: "scan: 20 leads at recently funded AI startups"
2. System reads this file
3. Run: run_signal_2.sh with parameters
4. Script returns: founders with company info

## Scripts Used
- scripts/signal_2_funded/step1_yc.py

## Output Format
```json
{
  "source": "YC",
  "leads": [
    {
      "name": "Jane Smith",
      "title": "Founder/CEO",
      "company": "AI Startup Inc",
      "linkedin_url": "...",
      "funding_stage": "Series A",
      "industry": "AI"
    }
  ]
}
```

## Parameters
--industry (AI, SaaS, Fintech) | --location (region) | --batches (X26,W26,...) | --max (N)
```

---

### Step 2: Separate Scripts by Signal

**Move/Rename existing scripts:**

```bash
# Signal 1 scripts
mkdir -p scripts/signal_1_hiring
mv scripts/step1_fetch_jobs.js → scripts/signal_1_hiring/step1_linkedin_jobs.js
mv scripts/step1_indeed.py → scripts/signal_1_hiring/
mv scripts/step1_yc_jobs.py → scripts/signal_1_hiring/
mv scripts/step1_wellfound.py → scripts/signal_1_hiring/

# Signal 2 scripts
mkdir -p scripts/signal_2_funded
mv scripts/step1_yc.py → scripts/signal_2_funded/

# Common/Shared
mkdir -p scripts/common
cp scripts/step2_salesnav.js → scripts/common/salesnav.js
# Keep original for backward compatibility until all references updated
```

---

### Step 3: Create Signal-Specific Orchestrator Scripts

**`scripts/signal_1_hiring/run_signal_1.sh`**
```bash
#!/bin/bash

# SIGNAL 1: HIRING SIGNAL ORCHESTRATOR
# Runs all 4 sources for hiring in parallel
# Called by: SKILL.md when Signal 1 detected

KEYWORDS=$1
LOCATION=$2
INDUSTRY=${3:-""}
SENIORITY=${4:-"OWNER,CXO,VP,DIRECTOR"}
MAX=$5

echo "🔍 Signal 1 (HIRING) — Running 4 sources in parallel"

# Calculate split: LinkedIn 50%, Indeed 30%, YC 20%, Wellfound 0% (unless specified)
LINKEDIN_COUNT=$((MAX * 50 / 100))
INDEED_COUNT=$((MAX * 30 / 100))
YC_COUNT=$((MAX * 20 / 100))

# Run all in parallel
(
  node scripts/signal_1_hiring/step1_linkedin_jobs.js \
    --keywords "$KEYWORDS" \
    --location "$LOCATION" \
    --max "$LINKEDIN_COUNT" &
    
  python3 scripts/signal_1_hiring/step1_indeed.py \
    --keywords "$KEYWORDS" \
    --location "$LOCATION" \
    --max "$INDEED_COUNT" &
    
  python3 scripts/signal_1_hiring/step1_yc_jobs.py \
    --keywords "$KEYWORDS" \
    --location "$LOCATION" \
    --max "$YC_COUNT" \
    --batches "X26,W26,F25,S25,W25,S24" &
)

# All run in background, poll output/streaming/ for results
# Each source writes to: output/streaming/[source]-[timestamp].json

wait
echo "✅ All Signal 1 sources completed"
```

**`scripts/signal_2_funded/run_signal_2.sh`**
```bash
#!/bin/bash

# SIGNAL 2: RECENTLY FUNDED SIGNAL ORCHESTRATOR
# Runs YC public API for recently funded companies
# Called by: SKILL.md when Signal 2 detected

INDUSTRY=$1
LOCATION=$2
BATCHES=${3:-"X26,W26,F25,S25,W25,S24"}
MAX=$3

echo "🔵 Signal 2 (RECENTLY FUNDED) — Running YC public API"

python3 scripts/signal_2_funded/step1_yc.py \
  --industry "$INDUSTRY" \
  --location "$LOCATION" \
  --batches "$BATCHES" \
  --max "$MAX"

echo "✅ Signal 2 complete"
```

---

### Step 4: Update Main SKILL.md Dispatcher

**Modified flow in `SKILL.md`:**

```markdown
## STEP 1: DETECT SIGNAL

From query, determine:
- Signal 1 (HIRING) if: "hiring", "open roles", job titles
- Signal 2 (RECENTLY FUNDED) if: "recently funded", "seed", "Series", etc.

## STEP 2: READ SIGNAL-SPECIFIC .md FILE

- If Signal 1 → Read: `signals/SIGNAL_1_HIRING.md`
- If Signal 2 → Read: `signals/SIGNAL_2_RECENTLY_FUNDED.md`

Follow the documented workflow from that file.

## STEP 3: RUN SIGNAL-SPECIFIC ORCHESTRATOR

- If Signal 1 → Execute: `bash scripts/signal_1_hiring/run_signal_1.sh [params]`
- If Signal 2 → Execute: `bash scripts/signal_2_funded/run_signal_2.sh [params]`

## STEP 4: COLLECT RESULTS

Poll output directory for signal-specific results:
- Signal 1: `output/signal_1/leads-[timestamp].json`
- Signal 2: `output/signal_2/leads-[timestamp].json`

## STEP 5: STREAM TO USER

Send leads to Telegram one per message (same as before)
```

---

### Step 5: Separate Output Directories

**Create signal-specific output folders:**

```bash
mkdir -p output/signal_1     # Signal 1 results (LinkedIn, Indeed, YC Jobs)
mkdir -p output/signal_2     # Signal 2 results (YC Public API)
mkdir -p output/streaming    # Real-time during scan
```

**Naming:**
- Signal 1: `output/signal_1/leads_[timestamp].json`
- Signal 2: `output/signal_2/leads_[timestamp].json`
- Streaming (both): `output/streaming/[source]-[timestamp].json`

---

## Benefits of This Structure

✅ **Clear separation:** Signal-specific logic isolated
✅ **Easy to find:** Each signal has its own .md file with steps
✅ **Maintainability:** Scripts organized by signal
✅ **Scalability:** Easy to add Signal 3, 4 in future
✅ **Debugging:** Know exactly which signal-specific script failed
✅ **Documentation:** Each signal self-documented
✅ **Reusability:** Common functions (Sales Nav) in `scripts/common/`
✅ **Results tracking:** Signal-specific output folders

---

## Migration Plan (Implementation)

### Phase 1: Create New Structure (Day 1)
- [ ] Create `signals/` directory
- [ ] Create signal-specific .md files
- [ ] Create `scripts/signal_1_hiring/` directory
- [ ] Create `scripts/signal_2_funded/` directory
- [ ] Create `scripts/common/` directory
- [ ] Create signal-specific output folders

### Phase 2: Move Scripts (Day 1)
- [ ] Move step1_* scripts to signal-specific directories
- [ ] Create/copy salesnav.js to scripts/common/
- [ ] Update all path references in scripts

### Phase 3: Create Orchestrators (Day 1)
- [ ] Write run_signal_1.sh
- [ ] Write run_signal_2.sh
- [ ] Update SKILL.md dispatcher logic

### Phase 4: Test (Day 2)
- [ ] Test Signal 1 end-to-end
- [ ] Test Signal 2 end-to-end
- [ ] Verify output goes to signal-specific folders
- [ ] Verify Telegram streaming still works

### Phase 5: Documentation (Day 2)
- [ ] Update SKILL.md with new flow
- [ ] Document each signal-specific .md
- [ ] Create troubleshooting guide

---

## File Locations After Reorganization

```
skills/sdr-automation/
├── SKILL.md                          ← Main orchestrator (updated)

├── signals/
│   ├── SIGNAL_1_HIRING.md            ← NEW: All Signal 1 steps
│   └── SIGNAL_2_RECENTLY_FUNDED.md   ← NEW: All Signal 2 steps

├── scripts/
│   ├── common/
│   │   └── salesnav.js               ← NEW: Shared enrichment
│   │
│   ├── signal_1_hiring/              ← NEW: Signal 1 scripts
│   │   ├── run_signal_1.sh
│   │   ├── step1_linkedin_jobs.js
│   │   ├── step1_indeed.py
│   │   ├── step1_yc_jobs.py
│   │   └── step1_wellfound.py
│   │
│   └── signal_2_funded/              ← NEW: Signal 2 scripts
│       ├── run_signal_2.sh
│       └── step1_yc.py
│
├── output/
│   ├── signal_1/                     ← NEW: Signal 1 results
│   ├── signal_2/                     ← NEW: Signal 2 results
│   └── streaming/                    ← Real-time (both signals)
│
└── [existing: auth/, leads/, memory/, session/]
```

---

## Backward Compatibility

**Old scripts still exist (for now):**
- Keep originals with deprecation warnings
- Or: Create redirects that point to new locations
- Plan: Full deprecation after 2-3 weeks of testing

---

## Summary

| Item | Before | After |
|------|--------|-------|
| **Script organization** | Mixed | Signal-based |
| **Documentation** | Single file | Signal-specific files |
| **Orchestrator** | run_hiring_scan.sh | run_signal_1.sh + run_signal_2.sh |
| **Output** | Mixed folder | signal_1/ + signal_2/ |
| **Clarity** | Low | High |
| **Maintainability** | Medium | High |

---

## Ready to Implement?

Should I:
1. ✅ Create the new directory structure
2. ✅ Write the signal-specific .md files
3. ✅ Create the new orchestrator scripts
4. ✅ Move/rename existing scripts
5. ✅ Update SKILL.md dispatcher
6. ✅ Test both signals end-to-end

**Confirm and I'll proceed.**

