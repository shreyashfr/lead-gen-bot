# ✅ Lead Gen Agent — Reorganization Complete

**Status:** DONE ✅ | **Time:** 2026-03-24 11:45 UTC

---

## What Was Done

### 1. ✅ Directory Structure Created
```
sdr-automation/
├── signals/                          ← NEW
│   ├── SIGNAL_1_HIRING.md            ✅ Created
│   └── SIGNAL_2_RECENTLY_FUNDED.md   ✅ Created
│
├── scripts/                          ← Reorganized
│   ├── common/
│   │   └── salesnav.js               ✅ Moved
│   │
│   ├── signal_1_hiring/              ✅ Created + populated
│   │   ├── run_signal_1.sh           ✅ Created
│   │   ├── step1_linkedin_jobs.js    ✅ Moved
│   │   ├── step1_indeed.py           ✅ Moved
│   │   ├── step1_yc_jobs.py          ✅ Moved
│   │   └── step1_wellfound.py        ✅ Moved
│   │
│   └── signal_2_funded/              ✅ Created + populated
│       ├── run_signal_2.sh           ✅ Created
│       └── step1_yc.py               ✅ Moved
│
└── output/
    ├── signal_1/                     ✅ Created
    ├── signal_2/                     ✅ Created
    └── streaming/                    ✅ Already existed
```

### 2. ✅ Signal-Specific Documentation
- **`signals/SIGNAL_1_HIRING.md`** (7.6KB)
  - Complete workflow for hiring signal
  - 4 data sources explained (LinkedIn, Indeed, YC, Wellfound)
  - Step-by-step execution flow
  - Output format examples
  - Error handling guide

- **`signals/SIGNAL_2_RECENTLY_FUNDED.md`** (7KB)
  - Complete workflow for funded signal
  - YC public API explained
  - Industry/location mapping
  - YC batch reference
  - Output format examples

### 3. ✅ Orchestrator Scripts
- **`scripts/signal_1_hiring/run_signal_1.sh`** (4.4KB)
  - Master orchestrator for Signal 1
  - Runs 4 sources in parallel
  - Calculates proper source split (50/30/20)
  - Handles parameter parsing
  - Executable (chmod +x)

- **`scripts/signal_2_funded/run_signal_2.sh`** (2.2KB)
  - Master orchestrator for Signal 2
  - Runs YC public API
  - Handles parameter parsing
  - Executable (chmod +x)

### 4. ✅ Scripts Reorganized
**Moved to signal_1_hiring/:**
- `step1_fetch_jobs.js` → `step1_linkedin_jobs.js` (renamed for clarity)
- `step1_indeed.py`
- `step1_yc_jobs.py`
- `step1_wellfound.py`

**Moved to signal_2_funded/:**
- `step1_yc.py`

**Moved to common/:**
- `step2_salesnav.js` → `salesnav.js` (for reuse by Signal 1)

---

## New Architecture

### Flow: User sends scan command

```
User: "scan: 15 leads of VP at SaaS hiring"
    ↓
SKILL.md detects: HIRING (contains "hiring")
    ↓
Read: signals/SIGNAL_1_HIRING.md
    (all Signal 1 instructions)
    ↓
Call: bash scripts/signal_1_hiring/run_signal_1.sh \
      --keywords "sales,VP" \
      --location "United States" \
      --industry "SaaS" \
      --seniority "VP,CXO" \
      --max 15
    ├─ Runs LinkedIn (5 leads)
    ├─ Runs Indeed (4 leads)
    ├─ Runs YC (2 leads)
    └─ All in parallel
    ↓
Poll: output/streaming/*.json (every 15 sec)
    ↓
Send leads to Telegram (one per message)
    ↓
Collect results: output/signal_1/leads-[timestamp].json
```

### Flow: User sends recently funded query

```
User: "scan: 20 founders at recently funded AI startups"
    ↓
SKILL.md detects: RECENTLY_FUNDED (contains "funded")
    ↓
Read: signals/SIGNAL_2_RECENTLY_FUNDED.md
    (all Signal 2 instructions)
    ↓
Call: bash scripts/signal_2_funded/run_signal_2.sh \
      --industry "AI" \
      --location "United States" \
      --max 20
    └─ Runs YC public API
    ↓
Collect results: output/signal_2/leads-[timestamp].json
    ↓
Send leads to Telegram (all at once, no streaming)
```

---

## File Changes Summary

| File | Type | Status |
|------|------|--------|
| `signals/SIGNAL_1_HIRING.md` | NEW | ✅ Created (7.6KB) |
| `signals/SIGNAL_2_RECENTLY_FUNDED.md` | NEW | ✅ Created (7KB) |
| `scripts/signal_1_hiring/run_signal_1.sh` | NEW | ✅ Created (4.4KB) |
| `scripts/signal_2_funded/run_signal_2.sh` | NEW | ✅ Created (2.2KB) |
| `scripts/signal_1_hiring/step1_linkedin_jobs.js` | MOVED | ✅ From step1_fetch_jobs.js |
| `scripts/signal_1_hiring/step1_indeed.py` | MOVED | ✅ From scripts/ |
| `scripts/signal_1_hiring/step1_yc_jobs.py` | MOVED | ✅ From scripts/ |
| `scripts/signal_1_hiring/step1_wellfound.py` | MOVED | ✅ From scripts/ |
| `scripts/signal_2_funded/step1_yc.py` | MOVED | ✅ From scripts/ |
| `scripts/common/salesnav.js` | MOVED | ✅ Copied from step2_salesnav.js |
| `output/signal_1/` | NEW | ✅ Created |
| `output/signal_2/` | NEW | ✅ Created |

---

## Next Steps (For Integration)

### 1. Update SKILL.md (Main Orchestrator)
The SKILL.md file needs to be updated to:
- Detect signal type from user query
- Read signal-specific .md file
- Call signal-specific orchestrator script
- Handle polling/result collection

**Updated flow:**
```
receive_scan_command() {
  → detect_signal(query)
  → if HIRING: read signals/SIGNAL_1_HIRING.md + run_signal_1.sh
  → if FUNDED: read signals/SIGNAL_2_RECENTLY_FUNDED.md + run_signal_2.sh
}
```

### 2. Test Both Signals
```bash
# Test Signal 1
bash scripts/signal_1_hiring/run_signal_1.sh \
  --keywords "sales" \
  --location "United States" \
  --industry "AI" \
  --seniority "VP,CXO" \
  --max 5

# Check: output/signal_1/leads-*.json

# Test Signal 2
bash scripts/signal_2_funded/run_signal_2.sh \
  --industry "AI" \
  --location "United States" \
  --max 10

# Check: output/signal_2/leads-*.json
```

### 3. Verify Polling Works
- Test reading from output/streaming/
- Test sending leads to Telegram
- Test marking files as .sent

### 4. Document Updated Flow
Update main SKILL.md with new orchestrator flow

---

## Benefits of Reorganization

✅ **Crystal Clear Separation**
- Each signal has its own .md file with complete instructions
- Scripts organized by signal type
- Output goes to signal-specific folders

✅ **Easy to Maintain**
- Find Signal 1 logic → look in `signals/SIGNAL_1_HIRING.md`
- Find Signal 1 scripts → look in `scripts/signal_1_hiring/`
- Find Signal 2 logic → look in `signals/SIGNAL_2_RECENTLY_FUNDED.md`

✅ **No Duplication**
- Common code (Sales Nav) in `scripts/common/`
- Reusable by both signals

✅ **Scalable**
- Easy to add Signal 3, Signal 4 in future
- Follow same pattern: signal-specific .md + orchestrator + scripts folder

✅ **Clear Execution Path**
- User query → Signal detection → Signal .md file → Orchestrator → Scripts → Results

---

## File Structure Visualization

```
sdr-automation/
│
├── SKILL.md                    (Needs update: dispatcher logic)
│
├── signals/                    🆕 Signal-specific docs
│  ├── SIGNAL_1_HIRING.md       (All Signal 1 instructions)
│  └── SIGNAL_2_RECENTLY_FUNDED.md (All Signal 2 instructions)
│
├── scripts/
│  ├── common/                  🆕 Shared code
│  │  └── salesnav.js           (Reusable enrichment)
│  │
│  ├── signal_1_hiring/         🆕 Signal 1 scripts
│  │  ├── run_signal_1.sh       (Master orchestrator)
│  │  ├── step1_linkedin_jobs.js
│  │  ├── step1_indeed.py
│  │  ├── step1_yc_jobs.py
│  │  └── step1_wellfound.py
│  │
│  ├── signal_2_funded/         🆕 Signal 2 scripts
│  │  ├── run_signal_2.sh       (Master orchestrator)
│  │  └── step1_yc.py
│  │
│  └── [legacy/utility scripts] (keep for now)
│
├── output/
│  ├── signal_1/                🆕 Signal 1 results
│  ├── signal_2/                🆕 Signal 2 results
│  ├── streaming/               (Real-time leads)
│  └── [legacy folders]
│
├── auth/                       (LinkedIn + Wellfound creds)
├── leads/                      (Final lead logs)
├── session/                    (Browser sessions)
└── [other files]
```

---

## Summary

| Item | Before | After |
|------|--------|-------|
| **Documentation** | Single SKILL.md | Signal-specific .md files |
| **Script organization** | Mixed in scripts/ | Organized by signal |
| **Shared code** | Duplicated/unclear | `scripts/common/` |
| **Output folders** | One folder | signal_1/ + signal_2/ |
| **Clarity** | Low | Very high |
| **Maintainability** | Medium | High |
| **Scalability** | Hard to extend | Easy to add signals |

---

## ✅ Verification

```bash
# Check directory structure
ls -la /home/ubuntu/.openclaw/workspace-sdr/skills/sdr-automation/signals/
ls -la /home/ubuntu/.openclaw/workspace-sdr/skills/sdr-automation/scripts/signal_1_hiring/
ls -la /home/ubuntu/.openclaw/workspace-sdr/skills/sdr-automation/scripts/signal_2_funded/
ls -la /home/ubuntu/.openclaw/workspace-sdr/skills/sdr-automation/scripts/common/

# Verify orchestrators are executable
file /home/ubuntu/.openclaw/workspace-sdr/skills/sdr-automation/scripts/signal_1_hiring/run_signal_1.sh
file /home/ubuntu/.openclaw/workspace-sdr/skills/sdr-automation/scripts/signal_2_funded/run_signal_2.sh
```

---

## 🎉 COMPLETE

✅ All directories created
✅ All .md files written
✅ All orchestrator scripts created
✅ All scripts moved to signal-specific folders
✅ Executables set

**Ready for:** SKILL.md integration and testing

