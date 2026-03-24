# Lead Gen Agent — Message Flow & Setup (Detailed)

## 📋 CURRENT STATE (Existing SKILL.md)

### Message 1: Initial Status Message (SENT FIRST, before any exec)

**For HIRING Signal:**
```
🔍 Scanning now...

Looking for [N] [seniority] leads at [industry] companies actively hiring for [role].
🎯 Sources: LinkedIn Jobs + YC Work at a Startup + Indeed (running in parallel)
📍 Location: [location]

⏱ Est. time: ~10-12 mins. Leads will stream in as each source finishes.
```

**For RECENTLY FUNDED Signal:**
```
🔍 Scanning now...

Looking for [N] [seniority] leads at recently funded [industry] startups.
🎯 Signal: YC-backed companies (recent batches)

⏱ Est. time: ~2 mins. Sending results shortly.
```

### Message 2-N: Individual Lead Messages (STREAMED in real-time)

**For HIRING (LinkedIn):**
```
🏢 *[company]* · [location]
💼 Hiring: [hiring]
🔖 Source: LinkedIn

👤 [Name] — [Title]
🔗 [profileUrl]
```

**For HIRING (YC Work at a Startup):**
```
🏢 *[company]* · [location]
💼 Hiring: [hiring]
🔖 Source: YC Work at a Startup

👤 [Name] — [Title]
🔗 [profileUrl]
```

**For RECENTLY FUNDED (YC):**
```
🏢 *[company]* · [location] · YC [batch]
👤 [Name] — [Title]
🔗 [linkedin_url]
```

### Message Final-1: Excel File Attachment
```
[Sends Excel file with all leads]
```

### Message Final: Summary Message
```
──────────────────────────
✅ Scan complete

[N] decision makers · [M] companies
Signal: [Hiring via LinkedIn + YC Work at a Startup / Recently Funded via YC]
📌 LinkedIn: [X] leads · YC: [Y] leads   ← only for hiring
🕐 [date]

📊 All leads exported to Excel (attached above)
```

---

## ⚙️ CURRENT EXECUTION FLOW (Step-by-Step)

```
1. RECEIVE SCAN COMMAND
   ├─ User: "scan: 15 leads of VP at SaaS companies hiring"
   └─ Parse query

2. DETECT SIGNAL
   ├─ Check: "hiring" detected?
   ├─ YES → Signal = HIRING
   └─ Return signal + extracted params

3. VALIDATE PARAMS
   ├─ Extract: [N], [seniority], [industry], [location], [role keywords]
   └─ Fill defaults if missing

4. SEND MESSAGE 1 (BEFORE ANY EXEC)
   ├─ Use template for detected signal
   ├─ Fill with extracted params
   └─ Message user immediately

5. RUN SCAN (in background)
   ├─ If HIRING: bash run_hiring_scan.sh [params]
   ├─ If FUNDED: python3 step1_yc.py [params]
   └─ Return immediately (scripts run in background)

6. POLL FOR RESULTS (every 15 seconds)
   ├─ Check: output/streaming/*.json
   ├─ Read new .json files
   ├─ Send each lead (one Telegram message per lead)
   └─ Rename to .sent

7. WAIT FOR COMPLETION
   ├─ Check: Are all sources still running?
   ├─ Check: Any unsent .json files?
   └─ When no more: proceed to step 8

8. GENERATE EXCEL
   ├─ Run: python3 generate_leads_excel.py
   ├─ Wait for completion
   └─ Get output file path

9. SEND EXCEL + SUMMARY
   ├─ Send Excel file as attachment
   ├─ Send summary message with counts
   └─ Done
```

---

## 🔄 PROPOSED CHANGES

### Problem with Current Approach

The current SKILL.md is:
- ❌ Tightly coupled to old script names (step1_fetch_jobs.js, step1_yc.py, etc.)
- ❌ Doesn't reference signal-specific orchestrators (run_signal_1.sh, run_signal_2.sh)
- ❌ Doesn't reference signal-specific .md files
- ❌ Old structure mixed everything together

### Solution: Signal-Based Architecture

**NEW FLOW:**

```
1. RECEIVE SCAN COMMAND
   └─ "scan: 15 leads of VP at SaaS hiring"

2. DETECT SIGNAL
   ├─ Parse query for keywords
   ├─ If contains "hiring" → Signal 1 (HIRING)
   └─ If contains "funded" → Signal 2 (RECENTLY FUNDED)

3. READ SIGNAL-SPECIFIC .md FILE
   ├─ Signal 1 → signals/SIGNAL_1_HIRING.md
   ├─ Signal 2 → signals/SIGNAL_2_RECENTLY_FUNDED.md
   └─ (Understand all steps + sources for this signal)

4. EXTRACT & VALIDATE PARAMS
   ├─ From query: extract [N], [seniority], [industry], [location], [role]
   └─ Apply signal-specific mappings

5. SEND MESSAGE 1 (Status)
   ├─ Signal-specific template
   ├─ Fill with extracted params
   └─ Message user immediately

6. RUN SIGNAL-SPECIFIC ORCHESTRATOR (in background)
   ├─ Signal 1 → bash scripts/signal_1_hiring/run_signal_1.sh [params]
   ├─ Signal 2 → bash scripts/signal_2_funded/run_signal_2.sh [params]
   └─ Return immediately

7. POLL FOR RESULTS
   ├─ Signal 1 → poll output/streaming/*.json (real-time)
   ├─ Signal 2 → wait then read output/signal_2/leads-*.json (batch)
   ├─ Send leads (one Telegram message per lead)
   └─ Rename to .sent

8. WAIT FOR COMPLETION
   ├─ Check process status
   ├─ Check for unsent files
   └─ When all done: proceed

9. SEND EXCEL + SUMMARY
   ├─ Generate Excel
   ├─ Send attachment
   ├─ Send summary
   └─ Done
```

---

## 📝 MESSAGE TEMPLATES (Proposed Updates)

### Message 1: Status (Same, but clearer)

**For SIGNAL 1 (HIRING):**
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

**For SIGNAL 2 (RECENTLY FUNDED):**
```
🔍 Scanning for recently funded startups...

Looking for [N] founders/leaders at [industry] companies that recently raised funding.

🎯 Source: YC-backed companies (recent batches)

📍 Region: [location]
⏱ Est. time: 2 mins

Results coming shortly...
```

### Message 2-N: Individual Leads (IMPROVED FORMAT)

**For SIGNAL 1 - LinkedIn Source:**
```
🔗 LinkedIn · [source: "LinkedIn"]

👤 [Name]
📍 [Title] @ [Company] ([Location])
💼 Hiring for: [role keyword]
📧 Email: [email if available]

🔗 https://linkedin.com/in/[profile]
```

**For SIGNAL 1 - YC Work at a Startup Source:**
```
🎯 YC Work at a Startup · [source: "YC Work at a Startup"]

👤 [Founder Name]
📍 [Title/Role] @ [Company] ([Location])
💼 Hiring for: [role keyword]

🔗 https://linkedin.com/in/[profile]
```

**For SIGNAL 1 - Indeed Source:**
```
💼 Indeed · [source: "Indeed"]

👤 [Name if available, else "Company contact"]
📍 [Title] @ [Company] ([Location])
💼 Hiring for: [role keyword]

🔗 https://linkedin.com/company/[company-url]
```

**For SIGNAL 2 - YC Recently Funded:**
```
🏆 YC [Batch] · [source: "YC"]

👤 [Founder Name]
📍 Founder @ [Company] ([Location])
💰 Funding: [Stage] · [Amount if available]
🏭 Industry: [Industry]

🔗 https://linkedin.com/in/[profile]
```

### Message Final-1: Excel Attachment (Same)
```
[Excel file with all leads]
```

### Message Final: Summary (IMPROVED)

```
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Scan Complete

📊 Results:
[N] decision-makers found across [M] companies

🎯 Signal: [HIRING / RECENTLY FUNDED]
📌 Breakdown by source:
  • [Source A]: [X] leads
  • [Source B]: [Y] leads
  • [Source C]: [Z] leads

📅 Scanned: [Date] [Time]
⏱ Duration: [X] mins

📥 All leads exported to Excel ↑
━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔄 DETAILED STEP-BY-STEP FOR EACH SIGNAL

### SIGNAL 1: HIRING (Complete Flow)

**STEP 1: Receive & Parse Query**
```
Input: "scan: 15 leads of VP, CXO at SaaS companies in US hiring for account executive"

Extract:
├─ [N] = 15
├─ [seniority] = "VP,CXO" → "VP,CXO"
├─ [industry] = "SaaS" → "SaaS"
├─ [location] = "US" → "United States"
├─ [role] = "account executive" → "account executive,account manager,sales"
└─ Signal detected = HIRING (contains "hiring")
```

**STEP 2: Send Status Message**
```
Send to user:
"
🔍 Scanning for hiring leads...

Looking for 15 VP, CXO decision-makers at SaaS companies actively hiring for account executive.

🎯 Sources:
  • LinkedIn Jobs + Sales Nav (50% = 8 leads)
  • Indeed (30% = 4 leads)
  • YC Work at a Startup (20% = 3 leads)

📍 Location: United States
⏱ Est. time: 10-12 mins

Leads will stream in as sources finish...
"
```

**STEP 3: Run Orchestrator**
```bash
bash scripts/signal_1_hiring/run_signal_1.sh \
  --keywords "account executive,account manager,sales" \
  --location "United States" \
  --industry "SaaS" \
  --seniority "VP,CXO" \
  --max 15
```

**STEP 4: Poll & Send Leads**
```
Loop every 15 seconds:
├─ Check: output/streaming/linkedin-*.json (new files?)
├─ Check: output/streaming/indeed-*.json (new files?)
├─ Check: output/streaming/yc-*.json (new files?)
├─ For each new file:
│  ├─ Read JSON
│  ├─ Get source field
│  ├─ For each lead in array:
│  │  ├─ Build message using signal+source template
│  │  ├─ Send message to user
│  │  └─ Rename file to .sent
│  └─ Continue
└─ When no new files and process exited: exit loop
```

**STEP 5: Send Excel + Summary**
```
1. Generate Excel:
   python3 scripts/generate_leads_excel.py
   → Output: output/leads_2026-03-24-11-50-00.xlsx

2. Send file attachment

3. Send summary:
"
━━━━━━━━━━━━━━━━━━━━━━━━
✅ Scan Complete

📊 Results:
15 decision-makers found across 8 companies

🎯 Signal: HIRING
📌 Breakdown:
  • LinkedIn: 8 leads
  • Indeed: 4 leads
  • YC: 3 leads

📅 Scanned: 2026-03-24 11:48 UTC
⏱ Duration: 11 mins

📥 All leads exported to Excel ↑
━━━━━━━━━━━━━━━━━━━━━━━━
"
```

---

### SIGNAL 2: RECENTLY FUNDED (Complete Flow)

**STEP 1: Receive & Parse Query**
```
Input: "scan: 20 founders at recently funded AI startups in India"

Extract:
├─ [N] = 20
├─ [seniority] = "Founder" (implied from context)
├─ [industry] = "AI" → "AI"
├─ [location] = "India" → "South Asia"
└─ Signal detected = RECENTLY_FUNDED (contains "recently funded")
```

**STEP 2: Send Status Message**
```
Send to user:
"
🔍 Scanning for recently funded startups...

Looking for 20 founders/leaders at AI companies that recently raised funding.

🎯 Source: YC-backed companies (recent batches X26, W26, F25, S25, W25)

📍 Region: South Asia (India focus)
⏱ Est. time: 2-3 mins

Results coming shortly...
"
```

**STEP 3: Run Orchestrator**
```bash
bash scripts/signal_2_funded/run_signal_2.sh \
  --industry "AI" \
  --location "South Asia" \
  --max 20
```

**STEP 4: Wait & Collect Results**
```
Wait for process to complete (usually 2-3 mins)
Then read: output/signal_2/leads-2026-03-24T11-50-00.json
```

**STEP 5: Send Leads (Batch)**
```
For each lead in output/signal_2/leads-*.json:
├─ Build message using SIGNAL_2 template
├─ Send message to user
└─ Continue for all leads
```

**STEP 6: Send Excel + Summary**
```
1. Generate Excel:
   python3 scripts/generate_leads_excel.py
   → Output: output/leads_2026-03-24-11-50-00.xlsx

2. Send file attachment

3. Send summary:
"
━━━━━━━━━━━━━━━━━━━━━━━━
✅ Scan Complete

📊 Results:
20 founders found across 20 companies

🎯 Signal: RECENTLY FUNDED (YC-backed)
📌 Latest batches: X26 (Winter 2026), W26, F25, S25

📅 Scanned: 2026-03-24 11:48 UTC
⏱ Duration: 3 mins

📥 All leads exported to Excel ↑
━━━━━━━━━━━━━━━━━━━━━━━━
"
```

---

## 📋 PARAMETERS EXTRACTION GUIDE

### From Query String, Extract:

| Field | How to Extract | Example |
|-------|----------------|---------|
| **[N]** | First number in query | "scan: **15** leads..." → 15 |
| **[seniority]** | Words like VP, CXO, Director, Owner, CEO, Founder | "scan: 10 **VP, CXO**..." → "VP,CXO" |
| **[industry]** | Company type: AI, SaaS, fintech, healthtech, etc. | "at **SaaS** companies..." → "SaaS" |
| **[location]** | Geography: US, India, Europe, etc. | "in **US**..." → "United States" |
| **[role keywords]** | Job titles: Sales, SDR, Engineer, PM, etc. | "for **account executive**" → "account executive,sales" |
| **[signal]** | "hiring" → HIRING, "funded" → RECENTLY_FUNDED | contains "hiring" → HIRING |

### Mapping Examples:

| User Input | Extracted | Mapped |
|------------|-----------|--------|
| "10 SDRs hiring at fintech" | seniority="SDRs", signal="HIRING" | seniority="SDR", signal="HIRING" |
| "15 VP at AI companies in India" | industry="AI", location="India" | industry="AI", location="South Asia" |
| "20 founders at recently funded startups" | seniority="Founder", signal="RECENTLY_FUNDED" | seniority="Founder", signal="RECENTLY_FUNDED" |

---

## ✅ CHECKLIST FOR MESSAGE FLOW IMPLEMENTATION

### Phase 1: Signal Detection
- [ ] Detect HIRING (contains "hiring", "open roles", job titles)
- [ ] Detect RECENTLY_FUNDED (contains "funded", "raised", "YC", "seed")
- [ ] Default to HIRING if unclear

### Phase 2: Parameter Extraction
- [ ] Extract [N] from query
- [ ] Extract [seniority] and normalize
- [ ] Extract [industry] and map to YC tags
- [ ] Extract [location] and map to regions
- [ ] Extract [role keywords]

### Phase 3: Signal-Specific .md Reading
- [ ] If HIRING: read signals/SIGNAL_1_HIRING.md
- [ ] If RECENTLY_FUNDED: read signals/SIGNAL_2_RECENTLY_FUNDED.md

### Phase 4: Message 1 (Status)
- [ ] Build signal-specific status template
- [ ] Fill with extracted parameters
- [ ] Send to user BEFORE any exec

### Phase 5: Run Orchestrator
- [ ] If HIRING: bash scripts/signal_1_hiring/run_signal_1.sh
- [ ] If RECENTLY_FUNDED: bash scripts/signal_2_funded/run_signal_2.sh
- [ ] Run in background (return immediately)

### Phase 6: Poll & Stream Leads
- [ ] Signal 1: poll output/streaming/*.json every 15 sec
- [ ] Signal 2: wait then read output/signal_2/leads-*.json
- [ ] Send leads with signal+source templates
- [ ] Mark sent files as .sent

### Phase 7: Excel + Summary
- [ ] Generate Excel file
- [ ] Send attachment
- [ ] Send summary with counts + breakdown
- [ ] Include source breakdown in summary

---

## 🎯 SUMMARY OF CHANGES

| Aspect | Current | Proposed |
|--------|---------|----------|
| **Signal docs** | In SKILL.md | signal_1_HIRING.md + signal_2_FUNDED.md |
| **Orchestrators** | run_hiring_scan.sh (old name) | run_signal_1.sh + run_signal_2.sh |
| **Status message** | Generic | Signal-specific templates |
| **Lead message** | Generic | Signal+Source-specific templates |
| **Summary message** | Generic | Source breakdown included |
| **Excel generation** | Same | Same (but cleaner output) |
| **Reference** | Old script names | Signal-specific folders |

---

## 📌 KEY RULES

1. **MESSAGE FIRST** — Send status message BEFORE running any exec
2. **SIGNAL-SPECIFIC** — Read signal .md file after detecting signal
3. **ORCHESTRATOR** — Use signal-specific run_signal_*.sh scripts
4. **POLLING** — Signal 1 streams, Signal 2 batches
5. **TEMPLATES** — Use signal+source specific message templates
6. **EXCEL** — Generate and send after all leads streamed
7. **SUMMARY** — Include source breakdown in final message

---

## 🚀 IMPLEMENTATION READY

All infrastructure is ready:
- ✅ signals/SIGNAL_1_HIRING.md (complete)
- ✅ signals/SIGNAL_2_RECENTLY_FUNDED.md (complete)
- ✅ scripts/signal_1_hiring/run_signal_1.sh (executable)
- ✅ scripts/signal_2_funded/run_signal_2.sh (executable)

**Next:** Update SKILL.md with new message flow

