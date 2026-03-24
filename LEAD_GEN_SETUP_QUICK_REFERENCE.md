# Lead Gen Agent — Setup & Onboarding (Quick Reference)

## 🎯 User Journeys (3 Types)

### Journey 1: Guided Onboarding
```
/start → Welcome
  ↓
setup → Q1: What do you sell?
  ↓
[User answers] → Q2: Ideal customer?
  ↓
[User answers] → Q3: Target titles?
  ↓
[User answers] → Confirmed! Ready to scan
  ↓
scan → Quick scan (uses saved profile)
```

### Journey 2: Impatient User
```
/start → Welcome
  ↓
scan: 10 VP at SaaS hiring → Custom scan immediately
  ↓
[No onboarding needed yet]
  ↓
[Leads stream in...]
```

### Journey 3: Returning User
```
/start → Welcome back!
  ↓
scan → Uses saved profile from last time
  ↓
[Leads stream in...]
```

---

## 💬 Key Messages (Simplified)

### Message 1: /start
```
👋 Welcome to Lead Gen Agent!

Find high-quality B2B sales leads from:
• LinkedIn: Decision-makers at hiring companies
• Indeed: Job postings + companies
• YC: Startup founders
• Recently funded: Founders who just raised capital

Two scan types:
  🟢 HIRING → VPs, CXOs at companies recruiting
  🔵 RECENTLY FUNDED → Founders with fresh funding

How to use:
1. setup → Configure your preferences (2 mins)
2. scan → Get 15 leads (10-12 mins)
3. Leads arrive one by one + Excel export

Examples:
• scan: 15 VP at SaaS in US hiring for sales
• scan: 20 founders at recently funded AI startups
• scan (uses your saved profile)

Ready? Type "setup" or "scan: [query]"
```

### Message 2: Onboarding Q1
```
✅ Let's set you up!

Q1️⃣ What are you selling?

Example: "Sales training platform for mid-market SaaS"

Your answer:
```

### Message 3: Onboarding Q2
```
Got it! ✅

Q2️⃣ Who's your ideal customer?
(Industry, company size, location)

Example: "Mid-market SaaS in US (50-500 employees)"

Your answer:
```

### Message 4: Onboarding Q3
```
Perfect! ✅

Q3️⃣ Which decision maker titles?

Example: "VP Sales, VP Marketing, C-suite"

Your answer:
```

### Message 5: Onboarding Complete
```
━━━━━━━━━━━━━━━━━━━━━━━
✅ All set!

📋 Your Profile:
Product: [their answer]
ICP: [their answer]
Titles: [their answer]

🚀 Ready!

Try:
• scan → 15 leads (uses your profile)
• scan: [custom] → Override defaults
• help → All commands

Let's go?
━━━━━━━━━━━━━━━━━━━━━━━
```

### Message 6: Quick Scan (Using ICP)
```
🔍 Scanning using your profile...

Looking for 15 [titles] at [industry] in [location]
🎯 Signal: HIRING

⏱ Est: 10-12 mins

Leads coming...
```

### Message 7: Custom Scan (Parsing)
```
✅ Parsed your request:

Count: 15
Seniority: VP, CXO
Industry: SaaS
Location: US
Role: Account Executive
Signal: 🟢 HIRING

🔍 Scanning for hiring leads...

Looking for 15 VP, CXO at SaaS in US hiring for account executive.

🎯 Sources:
  • LinkedIn (50%)
  • Indeed (30%)
  • YC (20%)

⏱ Est: 10-12 mins

Leads will stream in...
```

### Message 8: Individual Lead (LinkedIn Source)
```
🔗 LinkedIn

👤 John Doe
📍 VP Sales @ TechCorp (San Francisco, CA)
💼 Hiring for: Account Executive
📧 john@techcorp.com

🔗 https://linkedin.com/in/johndoe
```

### Message 9: Final Summary
```
━━━━━━━━━━━━━━━━━━━━━━━
✅ Scan Complete

📊 Results: 15 leads · 8 companies

🎯 Signal: HIRING
📌 By source:
  • LinkedIn: 8 leads
  • Indeed: 4 leads
  • YC: 3 leads

📅 Scanned: 2026-03-24 12:03 UTC
⏱ Duration: 11 mins

📥 Excel export ↑

Next?
• scan → Run again
• leads → Show last results
• setup → Change profile
━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 Message Sequence (End-to-End)

```
1. /start
   ↓
2. setup
   ↓
3. Q1 answer (product)
   ↓
4. Q2 answer (ICP)
   ↓
5. Q3 answer (titles)
   ↓
6. Confirmation ✅
   ↓
7. scan
   ↓
8. Status (scanning...)
   ↓
9. Lead #1 (LinkedIn)
   ↓
10. Lead #2 (Indeed)
    ↓
11. Lead #3 (YC)
    ↓
... [repeat for all 15]
    ↓
16. Summary + Excel
```

---

## 💾 Data Stored (After Onboarding)

```
workspace-sdr/USER.md:
{
  "product": "Sales training platform",
  "icp": "Mid-market SaaS in US (50-500 employees)",
  "titles": "VP Sales, VP Marketing, C-suite",
  "onboarded_at": "2026-03-24T11:52:00Z"
}

workspace-sdr/ONBOARDING_COMPLETE:
[flag file]

workspace-sdr/leads/:
└─ latest_leads.json (from last scan)
```

---

## ⚡ Response Times

| Message | Speed | Notes |
|---------|-------|-------|
| /start | <1 sec | Immediate |
| setup Q1-Q3 | <1 sec | Each question |
| Confirmation | <1 sec | Parse + store |
| Scan starts | <5 sec | Start sources |
| Leads (stream) | Every 15-30 sec | One per message |
| Summary | ~11 mins (HIRING) or 2 mins (FUNDED) | After all leads |

---

## 🎯 Commands Overview

| Command | Use | Response |
|---------|-----|----------|
| `/start` | Welcome | Show capabilities + examples |
| `/help` | Reference | List all commands |
| `setup` | Onboarding | Ask Q1 |
| `scan` | Quick | Use saved ICP |
| `scan: [query]` | Custom | Parse + run |
| `leads` | History | Show last results |

---

## ✅ Checklist (Implementation Ready)

- ✅ /start message (complete)
- ✅ /help message (all commands)
- ✅ Onboarding flow (Q1-Q3)
- ✅ Confirmation (store + next steps)
- ✅ Quick scan (uses ICP)
- ✅ Custom scan (parse + confirm)
- ✅ Lead messages (source-specific)
- ✅ Summary message (source breakdown)
- ✅ History command (show last results)

---

## 🚀 Ready for Integration

All setup/onboarding messages designed and documented:
- ✅ User journeys mapped
- ✅ Message templates created
- ✅ State management defined
- ✅ Data storage structure ready
- ✅ Response times planned

**Next:** Add to SKILL.md dispatcher logic

