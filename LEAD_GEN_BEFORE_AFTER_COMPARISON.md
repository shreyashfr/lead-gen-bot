# Lead Gen Agent — Before & After Comparison

## 📊 MESSAGE FLOW: BEFORE vs AFTER

### BEFORE (Current SKILL.md)

```
User: "scan: 15 leads of VP at SaaS hiring"
    ↓
Parse query manually in SKILL.md
    ↓
Check: "hiring" keyword
    ↓
Reference old script names:
├─ step1_fetch_jobs.js (LinkedIn)
├─ step1_yc_jobs.py (YC Work at Startup)
├─ step1_indeed.py (Indeed)
├─ step1_wellfound.py (Wellfound)
└─ step2_salesnav.js (enrichment)
    ↓
Read: entire SKILL.md for hiring instructions
    ↓
Send Message 1:
"🔍 Scanning now...
Looking for 15 VP leads at SaaS companies...
📌 Sources: LinkedIn + YC + Indeed
⏱ Est time: 10-12 mins"
    ↓
Run: bash run_hiring_scan.sh [params]
    ↓
Poll: output/streaming/
    ↓
Send: Individual lead messages (generic format)
    ↓
Generate: Excel + summary
```

---

### AFTER (New Signal-Based Architecture)

```
User: "scan: 15 leads of VP at SaaS hiring"
    ↓
Parse query + detect HIRING signal
    ↓
Reference: signals/SIGNAL_1_HIRING.md (focused docs)
    ↓
Know exactly what to do:
├─ 4 sources (LinkedIn 50%, Indeed 30%, YC 20%, Wellfound optional)
├─ Parallel execution
├─ Real-time streaming
└─ All documented in one place
    ↓
Send Message 1 (Signal-specific template):
"🔍 Scanning for hiring leads...
Looking for 15 VP decision-makers at SaaS companies...
🎯 Sources: LinkedIn (50%) + Indeed (30%) + YC (20%)
📍 Location: [location]
⏱ Est time: 10-12 mins
Leads will stream in..."
    ↓
Run: bash scripts/signal_1_hiring/run_signal_1.sh [params]
    ↓
Poll: output/streaming/
    ↓
Send: Individual lead messages (Signal + Source specific)
    ├─ "🔗 LinkedIn source..."
    ├─ "🎯 YC Work at a Startup source..."
    └─ "💼 Indeed source..."
    ↓
Generate: Excel + source-breakdown summary
```

---

## 📝 MESSAGE TEMPLATES: BEFORE vs AFTER

### Message 1: Status

**BEFORE:**
```
🔍 Scanning now...

Looking for [N] [seniority] leads at [industry] companies actively hiring for [role].
🎯 Sources: LinkedIn Jobs + YC Work at a Startup + Indeed (running in parallel)
📍 Location: [location]

⏱ Est. time: ~10-12 mins. Leads will stream in as each source finishes.
```

**AFTER (Signal 1: HIRING):**
```
🔍 Scanning for hiring leads...

Looking for [N] [seniority] decision-makers at [industry] companies actively hiring for [role].

🎯 Sources: 
  • LinkedIn Jobs + Sales Nav (50%)
  • Indeed (30%)
  • YC Work at a Startup (20%)

📍 Location: [location]
⏱ Est. time: 10-12 mins

Leads will stream in as sources finish...
```

**AFTER (Signal 2: RECENTLY FUNDED):**
```
🔍 Scanning for recently funded startups...

Looking for [N] founders/leaders at [industry] companies that recently raised funding.

🎯 Source: YC-backed companies (recent batches)

📍 Region: [location]
⏱ Est. time: 2-3 mins

Results coming shortly...
```

---

### Message 2-N: Individual Leads

**BEFORE (Generic):**
```
🏢 *[company]* · [location]
💼 Hiring: [hiring]
🔖 Source: LinkedIn

👤 [Name] — [Title]
🔗 [profileUrl]
```

**AFTER (Signal 1 + LinkedIn Source):**
```
🔗 LinkedIn · Source: "LinkedIn"

👤 [Name]
📍 [Title] @ [Company] ([Location])
💼 Hiring for: [role keyword]
📧 Email: [email if available]

🔗 https://linkedin.com/in/[profile]
```

**AFTER (Signal 1 + YC Source):**
```
🎯 YC Work at a Startup · Source: "YC Work at a Startup"

👤 [Founder Name]
📍 [Title/Role] @ [Company] ([Location])
💼 Hiring for: [role keyword]

🔗 https://linkedin.com/in/[profile]
```

**AFTER (Signal 2 + YC Source):**
```
🏆 YC [Batch] · Source: "YC"

👤 [Founder Name]
📍 Founder @ [Company] ([Location])
💰 Funding: [Stage] · [Amount if available]
🏭 Industry: [Industry]

🔗 https://linkedin.com/in/[profile]
```

---

### Message Final: Summary

**BEFORE:**
```
──────────────────────────
✅ Scan complete

[N] decision makers · [M] companies
Signal: [Hiring via LinkedIn + YC Work at a Startup / Recently Funded via YC]
📌 LinkedIn: [X] leads · YC: [Y] leads   ← only for hiring signal
🕐 [date]

📊 All leads exported to Excel (attached above)
```

**AFTER:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Scan Complete

📊 Results:
[N] decision-makers found across [M] companies

🎯 Signal: [HIRING / RECENTLY FUNDED]
📌 Breakdown by source:
  • LinkedIn: [X] leads
  • Indeed: [Y] leads
  • YC: [Z] leads

📅 Scanned: [Date] [Time]
⏱ Duration: [X] mins

📥 All leads exported to Excel ↑
━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔧 EXECUTION: BEFORE vs AFTER

### BEFORE (What SKILL.md Says)

```
### STEP B — Run scan

#### If Signal = 🟢 HIRING

**ONE command — runs everything (LinkedIn + YC + Indeed) with correct proportional split:**

bash /home/ubuntu/.openclaw/workspace-sdr/skills/sdr-automation/scripts/run_hiring_scan.sh \
  --keywords "[role keywords from query]" \
  --location "[location]" \
  --industry "[industry — e.g. software, AI, fintech — omit if not specified]" \
  --seniority "[seniority from query — e.g. OWNER,CXO,VP,DIRECTOR]" \
  --max [N]
```

**Issues:**
- ❌ run_hiring_scan.sh is old name
- ❌ No reference to signals/SIGNAL_1_HIRING.md
- ❌ No reference to new script structure
- ❌ SKILL.md mixes everything

---

### AFTER (What SKILL.md Will Say)

```
### STEP 3: Read Signal-Specific Documentation

If Signal 1 (HIRING):
└─ Read: signals/SIGNAL_1_HIRING.md
   (Complete workflow + 4 sources + execution steps)

If Signal 2 (RECENTLY FUNDED):
└─ Read: signals/SIGNAL_2_RECENTLY_FUNDED.md
   (Complete workflow + YC API + execution steps)

### STEP 4: Run Signal-Specific Orchestrator

If Signal 1 (HIRING):
bash scripts/signal_1_hiring/run_signal_1.sh \
  --keywords "[role keywords]" \
  --location "[location]" \
  --industry "[industry]" \
  --seniority "[seniority]" \
  --max [N]

If Signal 2 (RECENTLY FUNDED):
bash scripts/signal_2_funded/run_signal_2.sh \
  --industry "[industry]" \
  --location "[location]" \
  --max [N]
```

**Benefits:**
- ✅ Clear reference to signal-specific .md
- ✅ Uses new signal-based orchestrators
- ✅ SKILL.md stays clean and high-level
- ✅ Details are in signal .md files

---

## 📂 SCRIPT REFERENCES: BEFORE vs AFTER

### BEFORE

SKILL.md mentions these scripts directly:
```
step1_fetch_jobs.js                 ← LinkedIn Jobs
step2_salesnav.js                   ← Sales Navigator
step1_yc_jobs.py                    ← YC Work at Startup
step1_indeed.py                     ← Indeed
step1_wellfound.py                  ← Wellfound
step1_yc.py                         ← YC Recently Funded
generate_leads_excel.py             ← Excel generation

Location: /home/ubuntu/.openclaw/workspace-sdr/skills/sdr-automation/scripts/
```

**Problem:** All mixed in one folder, no organization

---

### AFTER

SKILL.md references signal-specific orchestrators:
```
Signal 1 Orchestrator:
└─ scripts/signal_1_hiring/run_signal_1.sh
   (handles: LinkedIn + Indeed + YC + Wellfound)

Signal 2 Orchestrator:
└─ scripts/signal_2_funded/run_signal_2.sh
   (handles: YC Public API)

Individual Scripts (organized by signal):
├─ scripts/signal_1_hiring/
│  ├─ step1_linkedin_jobs.js
│  ├─ step1_indeed.py
│  ├─ step1_yc_jobs.py
│  └─ step1_wellfound.py
│
├─ scripts/signal_2_funded/
│  └─ step1_yc.py
│
└─ scripts/common/
   └─ salesnav.js (reusable)

Utilities:
└─ scripts/generate_leads_excel.py
```

**Benefits:** Clear organization by signal type

---

## 🎯 SIGNAL DOCUMENTATION: BEFORE vs AFTER

### BEFORE

Everything in SKILL.md (400+ lines):
```
- Signal detection rules
- Industry mapping
- Location mapping
- YC batch reference
- Execution steps
- Parsing rules
- Critical rules
- Lead message formats
- All mixed together
```

**Problem:** Hard to find what you need, 1 file is too big

---

### AFTER

Separated by signal (focused documentation):

**signals/SIGNAL_1_HIRING.md (7.6KB):**
- What it does
- When detected
- 4 data sources explained
- Source split (50/30/20)
- 7-step execution flow
- Parameter extraction
- Output formats
- Error handling
- Focused on SIGNAL 1 only

**signals/SIGNAL_2_RECENTLY_FUNDED.md (7KB):**
- What it does
- When detected
- YC API explained
- Industry/location mapping
- YC batch reference
- 6-step execution flow
- Parameter extraction
- Output formats
- Error handling
- Focused on SIGNAL 2 only

**SKILL.md (High-level):**
- Dispatcher logic
- Signal detection
- Which .md to read
- Which orchestrator to run
- High-level flow only

**Benefits:** Find exact info you need quickly, organized by context

---

## 📊 SIDE-BY-SIDE: OLD vs NEW SKILL.md FLOW

### OLD SKILL.md FLOW

```
receive_scan_command():
  ├─ parse query
  ├─ detect signal (check keywords)
  ├─ send message 1
  ├─ if HIRING:
  │  ├─ extract params
  │  ├─ run run_hiring_scan.sh
  │  ├─ poll output/streaming/
  │  └─ send leads (read from SKILL.md format)
  ├─ if RECENTLY_FUNDED:
  │  ├─ extract params
  │  ├─ run step1_yc.py directly
  │  ├─ wait for completion
  │  └─ send leads (read from SKILL.md format)
  ├─ generate excel
  └─ send summary

Issues:
├─ SKILL.md is 400+ lines
├─ All logic in one place
├─ References old script names
├─ No separation of concerns
└─ Hard to find specific info
```

---

### NEW SKILL.md FLOW

```
receive_scan_command():
  ├─ parse query
  ├─ detect signal (check keywords)
  ├─ read signal-specific .md
  │  ├─ if HIRING: read signals/SIGNAL_1_HIRING.md
  │  └─ if RECENTLY_FUNDED: read signals/SIGNAL_2_RECENTLY_FUNDED.md
  ├─ extract params (per signal)
  ├─ send message 1 (signal-specific template)
  ├─ run signal-specific orchestrator
  │  ├─ if HIRING: bash scripts/signal_1_hiring/run_signal_1.sh
  │  └─ if RECENTLY_FUNDED: bash scripts/signal_2_funded/run_signal_2.sh
  ├─ poll/collect results
  │  ├─ if HIRING: poll output/streaming/ (real-time)
  │  └─ if RECENTLY_FUNDED: wait then read output/signal_2/ (batch)
  ├─ send leads (signal+source specific templates)
  ├─ generate excel
  └─ send summary (with source breakdown)

Benefits:
├─ SKILL.md stays clean (~100 lines)
├─ Each signal fully documented in its .md
├─ Scripts organized by signal
├─ Clear separation of concerns
├─ Easy to find/modify specific signal logic
├─ Reusable shared code (common/salesnav.js)
└─ Scalable (easy to add Signal 3, 4)
```

---

## ✅ WHAT NEEDS TO CHANGE IN SKILL.md

### 1. Reduce SKILL.md size
- **Before:** 400+ lines (everything)
- **After:** ~100-150 lines (dispatcher + signal detection + orchestration)

### 2. Reference signal .md files
- **Add:** "If HIRING → read signals/SIGNAL_1_HIRING.md"
- **Add:** "If RECENTLY_FUNDED → read signals/SIGNAL_2_RECENTLY_FUNDED.md"

### 3. Update orchestrator references
- **Change:** `run_hiring_scan.sh` → `scripts/signal_1_hiring/run_signal_1.sh`
- **Change:** `step1_yc.py` → `scripts/signal_2_funded/run_signal_2.sh`

### 4. Update message templates
- **Add:** Signal 1 specific status message template
- **Add:** Signal 2 specific status message template
- **Add:** Source-specific lead message templates
- **Update:** Summary message with source breakdown

### 5. Simplify polling logic
- **Signal 1:** Poll `output/streaming/` every 15 sec
- **Signal 2:** Wait for completion, read `output/signal_2/`

### 6. Update excel + summary section
- **Same:** Generate excel
- **Update:** Summary includes source breakdown

---

## 🎯 SUMMARY OF CHANGES

| Aspect | Before | After | Benefit |
|--------|--------|-------|---------|
| **Documentation** | All in SKILL.md | Signal-specific .md | Focused, easier to find |
| **Orchestrators** | run_hiring_scan.sh | run_signal_1.sh + run_signal_2.sh | Clearer naming |
| **Scripts** | Mixed in scripts/ | Organized by signal | Easy to find |
| **Status message** | Generic | Signal-specific | More informative |
| **Lead message** | Generic | Signal+Source specific | Better formatting |
| **Summary** | Basic | Source breakdown | More detail |
| **SKILL.md size** | 400+ lines | 100-150 lines | More maintainable |

---

## 📌 KEY TAKEAWAYS

1. **Signal-specific documentation** — Each signal has its own .md file with complete workflow

2. **Signal-specific orchestrators** — run_signal_1.sh and run_signal_2.sh handle all complexity

3. **Organized scripts** — Scripts in signal-specific folders (signal_1_hiring/, signal_2_funded/, common/)

4. **Cleaner SKILL.md** — High-level dispatcher, details in signal .md files

5. **Better messages** — Signal and source-specific templates for better UX

6. **Scalable** — Easy to add new signals by creating new signal .md + orchestrator

---

## 🚀 READY FOR IMPLEMENTATION

All infrastructure is ready:
- ✅ signals/SIGNAL_1_HIRING.md (complete)
- ✅ signals/SIGNAL_2_RECENTLY_FUNDED.md (complete)
- ✅ scripts/signal_1_hiring/run_signal_1.sh (executable)
- ✅ scripts/signal_2_funded/run_signal_2.sh (executable)
- ✅ Scripts organized by signal
- ✅ Output directories created (output/signal_1/, output/signal_2/)

**Next step:** Update SKILL.md with new message flow and orchestration logic

