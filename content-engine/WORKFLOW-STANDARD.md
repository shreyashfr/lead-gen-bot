# Content Engine Workflow — Standard Process

**Version:** 1.0  
**Last Updated:** 2026-03-04

---

## 🎯 The Flow

### **Step 1: Trigger**
```
pillar: AI job displacement fears
```

---

### **Step 2: Research + Ideas Generation** (5-7 min)
Agent runs:
1. Reddit-scout (primary source)
2. Compiles research report
3. Generates 15 viral ideas with source attribution

**Output:** `ideas_report.md` with format:
```markdown
## Idea 01: [Title]
**Source:** 🔴 Reddit (r/subreddit, X upvotes)
**Hook:** [Opening line]
**Angle:** [One-line description]
**Format Fit:** [Best formats]
**Viral Score:** X/10
**Why It Works:** [Reasoning]
```

Agent presents: **"15 viral ideas generated. Pick one + format to start production."**

---

### **Step 3: Pick Idea + Format**
User replies:
```
1, LP
```

Translation: **Idea 1, LinkedIn Post**

**Format codes:**
- **LP** = LinkedIn Post
- **TH** = Twitter Thread
- **XA** = X Article (long-form)
- **TW** = Single Tweet
- **CA** = Instagram Carousel

---

### **Step 4: Draft Production** (2-3 min per piece)
Agent:
1. Reads `voice-memory.json`
2. Writes draft
3. Runs Voice Guardian validation (4 layers)
4. Presents only if passes

**Output format:**
```markdown
## ✍️ LinkedIn Post #1 — [Title]
**Piece 1 of 22**
**Idea:** #1 from ideas report
**Source:** 🔴 Reddit

[full content]

---

**Voice Guardian:** ✅ Passed
**Airtable:** Ready to push

Reply: "approved" or "fix: [issue]"
```

---

### **Step 5: Approval**
User replies **one of:**

#### **A) "approved"**
Agent:
- Pushes to Airtable
- Logs to `content-queue.md`
- Saves to `runs/<pillar>/<timestamp>/approved/`
- **Asks:** "Next piece? (e.g., '2, TH' for Idea 2 Thread)"

#### **B) "fix: [specific issue]"**
Agent:
- Runs reflection (if needed)
- Revises draft
- Re-validates with Voice Guardian
- Resubmits
- User approves or requests another fix

---

### **Step 6: Continue Production**
User picks next:
```
5, XA
```

Agent drafts X Article from Idea 5, repeats approval cycle.

---

### **Step 7: Progress Check** (every 5 pieces)
Agent shows:
```markdown
## 📊 PROGRESS UPDATE
**Completed:** 5 / 22 pieces
**Approved:** 5 ✅
**Pending:** 0
**Formats done:** 3 LP, 1 TH, 1 XA
**Est. time remaining:** ~50 minutes
```

---

### **Step 8: Run Complete**
After 22 pieces approved:
```markdown
# ✅ RUN COMPLETE — AI Job Displacement Fears
**Pieces:** 22 / 22 ✅
**Airtable:** 22 records pushed
**Files updated:** content-queue.md, research-log.md
**Run archive:** content-engine/runs/[pillar]/[timestamp]/
```

---

## 📋 Format Distribution Target (22 pieces)

From 15 ideas, typical distribution:
- **5 LinkedIn Posts** (top 5 ideas, long-form)
- **3 Twitter Threads** (numbered, 7-11 tweets each)
- **3 X Articles** (2000+ words, deep dives)
- **7 Single Tweets** (hooks, stats, hot takes)
- **4 Instagram Carousels** (frameworks, checklists, visual)

**Total:** 22 pieces ✅

---

## 🔑 Key Rules

### Production:
- ✅ One piece at a time (no batch dumping)
- ✅ Voice Guardian must approve before user sees it
- ✅ User explicitly picks each piece ("3, LP")
- ✅ Clear approval loop ("approved" or "fix: X")

### Ideas:
- ✅ Always show source (🔴 Reddit, 🐦 X, 📰 News)
- ✅ 15 ideas minimum (from Reddit for now)
- ✅ Viral score + reasoning for each
- ✅ Format fit suggestions

### Storage:
- ✅ Run archive: `content-engine/runs/<pillar>/<timestamp>/`
- ✅ Ideas: `ideas_report.md`
- ✅ Drafts: `drafts/` folder
- ✅ Approved: `approved/` folder
- ✅ Airtable IDs: `airtable_records.json`

### Chat Format:
- ✅ Emoji source indicators (🔴🐦📰💼)
- ✅ Clear piece numbering (Piece X of 22)
- ✅ Idea reference (#N from ideas report)
- ✅ Voice Guardian status
- ✅ Next-step prompt

---

## 🎬 Example Full Session

```
User: pillar: remote work burnout

Agent: [runs reddit-scout, generates ideas]

Agent: 
# 💡 15 VIRAL IDEAS — Remote Work Burnout
[shows all 15 ideas with sources]

Top 5: Idea 3, 7, 9, 12, 14
Pick one + format to start (e.g., "3, LP")

---

User: 3, LP

Agent: [drafts LinkedIn post from Idea 3]
## ✍️ LinkedIn Post #1 — The 4-Day Burnout Cycle
[full content]
Reply: "approved" or "fix: [issue]"

---

User: approved

Agent: ✅ Pushed to Airtable (rec...)
Logged to content-queue.md
Next piece? (e.g., "7, TH")

---

User: 7, TH

Agent: [drafts Twitter Thread from Idea 7]
## ✍️ Twitter Thread #1 — Why Remote Workers Burn Faster
[full thread, 9 tweets]
Reply: "approved" or "fix: [issue]"

---

User: fix: make hook more personal

Agent: [revises + resubmits]
## ✍️ Twitter Thread #1 — REVISED
[updated thread]
Reply: "approved" or "fix: [issue]"

---

User: approved

Agent: ✅ Pushed to Airtable
Next piece?

[continues until 22 pieces done]
```

---

## 📂 File Outputs Per Run

```
content-engine/runs/<pillar>/<timestamp>/
├── run_meta.json              # Status tracking
├── ideas_report.md            # 15 ideas with sources
├── drafts/
│   ├── linkedin-01.md
│   ├── thread-01.md
│   └── ...
├── approved/
│   ├── linkedin-01-approved.md
│   ├── thread-01-approved.md
│   └── ...
├── reflections/               # If any rejections
│   └── linkedin-02-reflection.json
└── airtable_records.json      # All pushed record IDs
```

---

**This is the standard. Every pillar follows this exact flow.**
