# Lead Gen Agent — Setup & Onboarding Messages

## 📋 USER JOURNEYS

### Journey 1: Cold Start User

```
User: /start
  ↓
Bot: Welcome message (show capabilities)
  ↓
User: Curious, asks "how do I use this?"
  ↓
Bot: Explain scan command
  ↓
User: Ready, says "setup" or "set me up"
  ↓
Bot: Onboarding flow (collect ICP)
  ↓
User: Completes 3 questions
  ↓
Bot: Confirm + explain how to scan
  ↓
User: Ready to scan, says "scan" or "scan: [query]"
  ↓
Bot: Run scan (Signal 1 or 2)
  ↓
[Leads stream in...]
```

### Journey 2: Direct Command User

```
User: /start
  ↓
Bot: Welcome message
  ↓
User: Impatient, sends directly: "scan: 10 VP at SaaS hiring"
  ↓
Bot: Accept it (no onboarding required)
  ↓
[Scan immediately, ask for ICP later if needed]
```

### Journey 3: Returning User

```
User: /start
  ↓
Bot: Welcome back message (recognize user)
  ↓
User: "scan" (without query)
  ↓
Bot: Use saved ICP from previous session
  ↓
Run scan with saved params
```

---

## 💬 MESSAGE TEMPLATES

### Message 1: /start — Welcome

**Current (Basic):**
```
/start or hi

Welcome + explain scan command
```

**Proposed (Complete):**
```
👋 Welcome to Lead Gen Agent!

I help you find high-quality B2B sales leads from multiple sources:
• LinkedIn: Decision-makers at companies actively hiring
• Indeed: Job postings + company LinkedIn profiles
• YC: Startup founders with jobs open
• Recently funded: Founders who just raised venture capital

Two types of scans:
  🟢 HIRING → Find VPs, CXOs, Directors at companies actively recruiting
  🔵 RECENTLY FUNDED → Find founders at startups that just raised funding

📌 How to use:
1. Set up your ICP (Ideal Customer Profile) — type "setup"
2. Run a scan — type "scan" (uses your ICP) or "scan: [custom query]"
3. Get leads — Telegram delivers them one by one + Excel export

Example commands:
• scan: 15 leads of VP at SaaS companies in US hiring for sales
• scan: 20 founders at recently funded AI startups in India
• scan (uses your saved profile)

Ready? Type "setup" to configure your preferences, or jump straight to "scan: [query]"

🤖 Questions? Type "help"
```

---

### Message 2: /help — Command Reference

```
📖 Commands:

/start         Show welcome message
setup          Configure your ICP (Ideal Customer Profile)
scan           Quick scan using saved ICP settings
scan: [query]  Custom scan (auto-detects signal type)
leads          Show results from last scan
help           Show this help menu

💡 Examples:

HIRING Signal (find decision-makers):
├─ scan: 10 VP, CXO at AI companies in US hiring for head of sales
├─ scan: 15 SDRs at fintech hiring engineers  
└─ scan: 20 marketing leaders at SaaS companies

RECENTLY FUNDED Signal (find founders):
├─ scan: 15 founders at recently funded AI startups
├─ scan: 20 CEO, CTO at newly funded companies in India
└─ scan: 25 founders at companies that raised Series A

Quick Scan (uses your saved profile):
└─ scan

ℹ️ Parameters auto-detected from your query:
• Count: First number (default 15)
• Seniority: VP, CXO, CEO, Director, Founder, etc.
• Industry: AI, SaaS, fintech, healthtech, etc.
• Location: US, India, Europe, etc.
• Signal: HIRING (default) or RECENTLY FUNDED (auto-detected)

🎯 Need help setting up? Type "setup"
```

---

### Message 3: setup — Onboarding Flow

**Step 1: Product/Service Question**
```
✅ Let's set up your profile!

Q1️⃣ What are you selling? (1-2 sentences)

Examples:
• "Sales training platform for mid-market SaaS"
• "No-code automation tool for enterprises"
• "Compliance software for fintech"

Your answer:
```

**Step 2: Ideal Customer Profile**
```
Q2️⃣ Who's your ideal customer?

Tell me about:
• Industry (AI, SaaS, fintech, healthtech, etc.)
• Company size (startup, SMB, mid-market, enterprise)
• Location (US, Europe, Asia, etc.)

Example:
"Mid-market SaaS companies in US (50-500 employees) in the marketing stack"

Your answer:
```

**Step 3: Decision Maker Titles**
```
Q3️⃣ Which decision maker titles do you target?

Examples:
• VP Sales, Sales Director, Head of Sales
• VP Marketing, CMO, Marketing Director
• VP Engineering, CTO, Engineering Director
• CEO, Founder, C-suite

Your answer:
```

**Confirmation & Next Steps**
```
━━━━━━━━━━━━━━━━━━━━━━━
✅ All set!

📋 Your Profile:
Product: [what they sell]
ICP: [ideal customer]
Titles: [target seniority]

🚀 Ready to find leads!

Try:
• scan → Quick scan (15 leads using your profile)
• scan: 20 VP at AI companies in US → Custom scan (override defaults)
• leads → Show last results
• help → Command reference

What's next?
━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Message 4: scan (without params) — Using Saved ICP

```
🔍 Scanning using your saved profile...

Looking for 15 [titles] at [industry] companies in [location]
🎯 Signal: [HIRING / RECENTLY FUNDED]

⏱ Est. time: [2-12 mins depending on signal]

Leads coming shortly...
```

---

### Message 5: scan: [custom query] — Confirming Custom Scan

```
✅ Custom scan detected!

Parsed from your query:
├─ Count: 15 leads
├─ Seniority: VP, CXO
├─ Industry: SaaS
├─ Location: United States
├─ Role: Account Executive
└─ Signal: 🟢 HIRING

🔍 Scanning for hiring leads...

Looking for 15 VP, CXO decision-makers at SaaS companies actively hiring for account executive.

🎯 Sources:
  • LinkedIn Jobs + Sales Nav (50% = 8 leads)
  • Indeed (30% = 4 leads)
  • YC Work at a Startup (20% = 3 leads)

📍 Location: United States
⏱ Est. time: 10-12 mins

Leads will stream in as sources finish...
```

---

### Message 6: leads — Show Last Results

```
📊 Last Scan Results:

🟢 Signal: HIRING
📅 Scanned: 2026-03-24 11:48 UTC
⏱ Duration: 11 mins

📈 Results: 15 leads found
├─ LinkedIn: 8 leads
├─ Indeed: 4 leads
└─ YC: 3 leads

📥 Excel file: leads_2026-03-24.xlsx (attached above)

🔄 Run another scan?
• scan → Use saved profile
• scan: [custom query] → Custom parameters
```

---

## 🔄 ONBOARDING STATE MANAGEMENT

### State 1: New User (Fresh /start)
```
Status: NOT_ONBOARDED
Has ICP: NO
Can scan: YES (but without defaults)

Actions available:
├─ setup → Start onboarding
├─ scan: [query] → Custom scan immediately
└─ help → Show commands
```

### State 2: Onboarding In Progress
```
Status: ONBOARDING_IN_PROGRESS
Stage: Question 1/2/3
Has ICP: PARTIAL

Show current question, track answers
```

### State 3: Onboarding Complete
```
Status: ONBOARDED
Has ICP: YES (stored in workspace)
Can scan: YES (with defaults)

Store ICP:
├─ product: "What user sells"
├─ icp: "Ideal customer profile"
├─ titles: "Target seniority"
└─ saved_at: "2026-03-24T11:52:00Z"
```

### State 4: Returning User
```
Status: ONBOARDED
Has ICP: YES (from previous session)
Can scan: YES (with/without defaults)

Recognize in welcome:
"Welcome back! Ready to scan? Type 'scan' to use your saved profile, or 'scan: [query]' for a custom search."
```

---

## 💾 USER WORKSPACE STRUCTURE

After onboarding, save to: `users/[user_id]/` (or `workspace-sdr/`)

```
workspace-sdr/
├── USER.md                          ← ICP Profile
│   {
│     "product": "Sales training platform",
│     "icp": "Mid-market SaaS in US",
│     "titles": "VP Sales, Sales Director",
│     "onboarded_at": "2026-03-24T11:52:00Z"
│   }
│
├── ONBOARDING_COMPLETE              ← Flag file
│
└── [other existing files]
```

---

## 📝 FULL CONVERSATION FLOW (Example)

### User Journey: Cold Start → Onboarding → First Scan

**User:** `/start`

**Bot:**
```
👋 Welcome to Lead Gen Agent!

I help you find high-quality B2B sales leads...

[full welcome message]

Ready? Type "setup" to configure, or "scan: [query]" to start immediately.
```

**User:** `setup`

**Bot:**
```
✅ Let's set up your profile!

Q1️⃣ What are you selling? (1-2 sentences)
```

**User:** `Sales training platform for mid-market SaaS companies`

**Bot:**
```
Got it! ✅

Q2️⃣ Who's your ideal customer?
(Industry, company size, location)
```

**User:** `Mid-market SaaS in US (50-500 employees)`

**Bot:**
```
Perfect! ✅

Q3️⃣ Which decision maker titles do you target?
(VP, CXO, Director, CEO, etc.)
```

**User:** `VP Sales, VP Marketing, C-suite`

**Bot:**
```
━━━━━━━━━━━━━━━━━━━━━━━
✅ All set!

📋 Your Profile:
Product: Sales training platform for mid-market SaaS
ICP: Mid-market SaaS in US (50-500 employees)
Titles: VP Sales, VP Marketing, C-suite

🚀 Ready to find leads!

Try:
• scan → Quick scan (15 leads)
• scan: 10 VP Sales at fintech in US → Custom scan
• help → Commands

What's next?
━━━━━━━━━━━━━━━━━━━━━━━
```

**User:** `scan`

**Bot:**
```
🔍 Scanning using your saved profile...

Looking for 15 VP Sales, VP Marketing, C-suite at Mid-market SaaS in US
🎯 Signal: HIRING

⏱ Est. time: 10-12 mins

Leads coming shortly...
```

[Leads stream in as individual messages...]

**Bot (Finally):**
```
━━━━━━━━━━━━━━━━━━━━━━━
✅ Scan Complete

📊 Results:
15 decision-makers found across 8 companies

🎯 Signal: HIRING
📌 Breakdown:
  • LinkedIn: 8 leads
  • Indeed: 4 leads
  • YC: 3 leads

📅 Scanned: 2026-03-24 12:03 UTC
⏱ Duration: 11 mins

📥 All leads exported to Excel ↑
━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎯 MESSAGE QUALITY CHECKLIST

### For /start Message
- ✅ Welcome tone (friendly, professional)
- ✅ Explain what the bot does (2-3 sentences)
- ✅ Show 2 signal types with clear icons
- ✅ Example commands (copy-paste ready)
- ✅ Call to action (setup or scan)

### For Onboarding Questions
- ✅ Clear, specific question
- ✅ Example answer provided
- ✅ Progress indicator (Q1/3, Q2/3, etc.)
- ✅ Acknowledge previous answer
- ✅ Small character count (not overwhelming)

### For Scan Status Message
- ✅ Confirm parsed parameters
- ✅ Show signal type with icon
- ✅ List sources (for HIRING)
- ✅ Est. time (realistic)
- ✅ Explain what happens next (leads will stream)

### For Lead Messages
- ✅ Source identifier (LinkedIn, YC, etc.)
- ✅ Person name + title + company
- ✅ LinkedIn URL (clickable)
- ✅ Hiring info (if available)
- ✅ Consistent format (recognize pattern)

### For Summary Message
- ✅ Total count
- ✅ Source breakdown
- ✅ Time/duration
- ✅ Excel attachment mention
- ✅ Next steps suggested

---

## 📱 RESPONSE TIME EXPECTATIONS

| Message | Response Time | Notes |
|---------|---------------|-------|
| /start | Immediate | Welcome message |
| setup (Q1) | Immediate | Send first question |
| setup (Q2) | Immediate | Acknowledge Q1, send Q2 |
| setup (Q3) | Immediate | Acknowledge Q2, send Q3 |
| setup (confirm) | Immediate | Acknowledge Q3, confirm all |
| scan | Immediate | Send status, start scan |
| scan (custom) | Immediate | Confirm parse, start scan |
| Leads (streaming) | Every 15-30 sec | One lead per message |
| Summary | After all leads | Final counts + Excel |

---

## 🔐 DATA PRIVACY

What we store:
- ✅ Product description
- ✅ ICP (industry, company size, location)
- ✅ Target seniority
- ✅ Scan history (dates, counts)
- ✅ Last results (for `leads` command)

What we DON'T store:
- ❌ LinkedIn session (regenerate each time)
- ❌ Individual lead data (ephemeral)
- ❌ Personal notes (user deletable)

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Welcome Messages
- [ ] /start message (complete, friendly)
- [ ] /help message (all commands listed)
- [ ] Recognize returning users

### Phase 2: Onboarding Flow
- [ ] Q1: Product/service
- [ ] Q2: Ideal customer
- [ ] Q3: Decision maker titles
- [ ] Confirmation message
- [ ] Store ICP in workspace
- [ ] Set onboarded flag

### Phase 3: Scan Integration
- [ ] Recognize "scan" (quick, uses ICP)
- [ ] Recognize "scan: [query]" (custom)
- [ ] Parse parameters from query
- [ ] Send signal-specific status message
- [ ] Run signal-specific orchestrator

### Phase 4: Results
- [ ] Stream leads as they come in
- [ ] Show summary with source breakdown
- [ ] Offer "leads" command for history
- [ ] Suggest next actions

---

## 🚀 READY FOR IMPLEMENTATION

All messages designed:
- ✅ /start welcome
- ✅ /help reference
- ✅ Onboarding flow (3 questions)
- ✅ Confirmation + next steps
- ✅ Quick scan (uses ICP)
- ✅ Custom scan (parse + confirm)
- ✅ Leads summary + history

Next: Integrate into SKILL.md + test with real user

