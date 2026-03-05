# Content Engine Production Flow — Standardized

**Version:** 1.0  
**Last Updated:** 2026-03-04

---

## 🎯 The Exact Flow

### **Step 1: User Triggers**
```
pillar: AI job displacement fears
```

---

### **Step 2: Agent Generates Ideas**
Agent runs reddit-scout and presents:

```markdown
# 💡 15 VIRAL IDEAS — AI Job Displacement Fears
**Source:** 🔴 Reddit (10 viral posts analyzed)

## Idea 01: If Workers Were in Charge...
**Source:** 🔴 Reddit (r/remoteworks, 3,535 upvotes)
**Hook:** "nobody's scared of automation. they're scared of who controls it."
**Viral Score:** 9/10

## Idea 02: AI Isn't Taking Your Job. Bad Management Is.
**Source:** 🔴 Reddit (pattern analysis)
**Hook:** "your company didn't lay you off because of AI. they used AI as the excuse."
**Viral Score:** 8.5/10

[... 13 more ideas ...]

---
**Top 5:** 1, 5, 2, 3, 14

**Pick idea + format:**
Format codes: LP (LinkedIn) | TH (Thread) | XA (X Article) | TW (Tweet) | CA (Carousel)
Example: "1, LP" or "5, XA"
```

---

### **Step 3: User Picks**
```
1, LP
```

Translation: **Generate LinkedIn Post from Idea 1**

---

### **Step 4: Agent Drafts**
Agent:
1. Reads Idea 1 details
2. Reads voice-memory.json
3. Drafts LinkedIn post
4. Validates with Voice Guardian
5. Presents only if passes

```markdown
## ✍️ LinkedIn Post — If Workers Were in Charge...
**Idea:** #1 | **Source:** 🔴 Reddit | **Piece:** 1 of 22

[full content here]

---
**Voice Guardian:** ✅ Passed
Reply: "approved" or "fix: [what to change]"
```

---

### **Step 5: User Approves or Fixes**

#### Option A: Approved
```
approved
```

Agent:
- ✅ Pushes to Airtable
- ✅ Logs to content-queue.md
- ✅ Saves to approved/ folder
- **Asks:** "Next? (e.g., '2, TH' or '5, XA')"

#### Option B: Fix
```
fix: make the hook more personal, remove the bullet points
```

Agent:
- Revises based on feedback
- Re-validates
- Resubmits draft
- User says "approved" or gives another fix

---

### **Step 6: Continue**
```
5, XA
```

Agent drafts X Article from Idea 5, repeats cycle.

---

### **Step 7: Track Progress**
Every 5 pieces:
```markdown
## 📊 PROGRESS — 5 / 22 pieces ✅
Formats done: 3 LP, 1 TH, 1 XA
Next?
```

---

### **Step 8: Complete**
After 22 pieces:
```markdown
✅ RUN COMPLETE — 22/22 pieces
Airtable: 22 records pushed
Archive: content-engine/runs/[pillar]/[timestamp]/
```

---

## 📝 Format Codes

| Code | Format | Typical Length | Best For |
|------|--------|----------------|----------|
| **LP** | LinkedIn Post | 300-600 words | Long-form thought leadership, stories, frameworks |
| **TH** | Twitter Thread | 7-11 tweets | Numbered breakdowns, multi-point arguments |
| **XA** | X Article | 2000+ words | Deep dives, research-heavy, case studies |
| **TW** | Single Tweet | 1 tweet | Hooks, stats, hot takes, questions |
| **CA** | Instagram Carousel | 5-7 slides | Frameworks, checklists, visual steps |

---

## 🎯 Example Session

```
User:
pillar: remote work burnout

Agent:
# 💡 15 VIRAL IDEAS — Remote Work Burnout
[shows all 15 ideas with Reddit sources]
Pick idea + format (e.g., "3, LP")

---

User:
3, LP

Agent:
## ✍️ LinkedIn Post — The 4-Day Burnout Cycle
[full content]
Reply: "approved" or "fix: [what to change]"

---

User:
approved

Agent:
✅ Pushed to Airtable (rec...)
Next? (e.g., "7, TH")

---

User:
7, TH

Agent:
## ✍️ Twitter Thread — Why Remote Workers Burn Faster
[full thread, 9 tweets numbered 1/9 to 9/9]
Reply: "approved" or "fix: [what to change]"

---

User:
fix: make tweet 3 shorter, remove the data point

Agent:
## ✍️ Twitter Thread — REVISED
[updated thread with shorter tweet 3]
Reply: "approved" or "fix: [what to change]"

---

User:
approved

Agent:
✅ Pushed to Airtable
Next?

---

User:
3, XA

Agent:
## ✍️ X Article — The 4-Day Burnout Cycle (Deep Dive)
[2000+ word article]
Reply: "approved" or "fix: [what to change]"

[continues until 22 pieces done]
```

---

## 🔄 Multiple Formats from Same Idea

You can use the same idea for multiple formats:

```
User: 1, LP
Agent: [drafts LinkedIn post from Idea 1]
User: approved

User: 1, TH
Agent: [drafts Thread from same Idea 1, different angle]
User: approved

User: 1, TW
Agent: [drafts single Tweet hook from Idea 1]
User: approved
```

**Result:** 3 pieces from 1 idea, adapted per format

---

## 📊 Typical Distribution (22 pieces from 15 ideas)

| Format | Count | Ideas Used |
|--------|-------|------------|
| LinkedIn Posts | 5 | Ideas 1, 2, 5, 8, 14 |
| Twitter Threads | 3 | Ideas 1, 4, 6 |
| X Articles | 3 | Ideas 5, 7, 11 |
| Tweets | 7 | Ideas 2, 3, 4, 9, 10, 13, 15 |
| Carousels | 4 | Ideas 3, 8, 15, 4 |
| **TOTAL** | **22** | *Some ideas → multiple formats* |

---

## 🎨 Format-Specific Guidelines

### **LinkedIn Post (LP)**
- Length: 300-600 words
- Structure: Hook → Body (bullets or paragraphs) → Insight → P.S.
- Tone: Conversational, lowercase, no jargon
- Voice Guardian checks: forbidden phrases, tone match, AI detection

### **Twitter Thread (TH)**
- Length: 7-11 tweets
- Structure: Hook tweet (1/N) → Body tweets → Closing standalone tweet (N/N)
- Format: Numbered (e.g., "1/9", "2/9", etc.)
- Each tweet: 220-280 chars ideal

### **X Article (XA)**
- Length: 2000-3000 words
- Structure: Title → Hook → Sections with headers → Conclusion
- Tone: Deeper, more research, but still conversational
- Can include data, examples, stories

### **Single Tweet (TW)**
- Length: 1 tweet, 220-280 chars
- Types: Hook, stat, question, hot take, quote, resource
- Must work standalone (no thread dependency)

### **Instagram Carousel (CA)**
- Length: 5-7 slides
- Slide 1: Hook + P.S. tease
- Slides 2-5: Content (one point per slide)
- Last slide: CTA (comment keyword or action)
- Text only (no images/design)

---

## 🚨 Rules

### Agent Must:
- ✅ Only show ONE piece at a time
- ✅ Wait for "approved" before moving on
- ✅ Run Voice Guardian before showing
- ✅ Push to Airtable after approval
- ✅ Ask "Next?" after every approval

### Agent Must NOT:
- ❌ Dump multiple drafts at once
- ❌ Show drafts that fail Voice Guardian
- ❌ Assume approval (always wait for "approved")
- ❌ Skip Airtable push

### User Can:
- ✅ Pick any idea + any format
- ✅ Use same idea multiple times for different formats
- ✅ Request unlimited fixes ("fix: X")
- ✅ Change order anytime

---

## 📂 Storage Structure

```
content-engine/runs/<pillar>/<timestamp>/
├── ideas_report.md              # 15 ideas (generated once)
├── drafts/
│   ├── linkedin-01-idea-01.md   # Draft versions
│   ├── thread-01-idea-07.md
│   └── ...
├── approved/
│   ├── linkedin-01-idea-01.md   # Final approved versions
│   ├── thread-01-idea-07.md
│   └── ...
└── airtable_records.json        # Record IDs for all pushed pieces
```

---

**This is the standard. Never deviate from this flow.**
