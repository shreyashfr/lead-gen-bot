# Content Engine — Quick Reference Guide

## 19 Skills at a Glance

### CORE PIPELINE (9 Skills) — Main Content Creation Flow

| # | Skill | What it Does | Files | When |
|---|-------|-------------|-------|------|
| 1 | **DISPATCHER** | Entry point, identifies user, routes to payment/onboarding/engine | SKILL.md | Every Telegram message |
| 2 | **ONBOARDING** | Collects master-doc, builds workspace | SKILL.md | New paid user |
| 3 | **PILLAR-WORKFLOW** | Main orchestrator, runs 5-step pipeline | SKILL.md + run_research.sh | "Pillar: [topic]" |
| 4 | **RESEARCH-AGENT** | Runs 4 scouts in parallel, validates data | SKILL.md | Step 1 of pillar |
| 5 | **IDEA-GENERATOR** | Generates 15 ideas with hooks + sources | SKILL.md | Step 4 of pillar (subagent) |
| 6 | **CONTENT-PRODUCER** | Writes 5 formats: LP, XA, TH, TW, CA | SKILL.md | After ideas approved |
| 7 | **VOICE-GUARDIAN** | Validates every draft before output | SKILL.md | After each draft |
| 8 | **REFLECTION-AGENT** | Learns from rejections, updates voice-memory | SKILL.md | When draft rejected |
| 9 | **AI-HUMANIZER** | Removes AI writing patterns (12 checks) | SKILL.md | Called by voice-guardian |

---

### SCOUT/RESEARCH SKILLS (4 Skills) — Data Collection

| # | Skill | Source | Outputs | Command |
|---|-------|--------|---------|---------|
| 10 | **REDDIT SCOUT** | Subreddits + posts | top_posts_detailed.json, cards, report.md | `--niche "topic"` |
| 11 | **TWITTER SCOUT** | X/Twitter search | posts_ranked.json, report.md | `--query "topic"` |
| 12 | **YOUTUBE SCOUT** | YouTube videos | posts_ranked.json (with transcripts), report.md | `--query "topic"` |
| 13 | **GOOGLE NEWS SCOUT** | Google News RSS | articles.json, report.md | `--query "topic"` |

---

### SUPPORTING/OPTIONAL SKILLS (4 Skills) — Enhancements

| # | Skill | Purpose | When | Optional? |
|---|-------|---------|------|-----------|
| 14 | **FEED-INTELLIGENCE** | Daily niche scan (30+ posts) | Daily or before pillar | Yes |
| 15 | **COMPETITIVE-TRACKER** | Weekly competitor analysis | Weekly or on-demand | Yes |
| 16 | **PERFORMANCE-TRACKER** | Published post metrics | Weekly, after publishing | Yes |
| 17 | **COORDINATOR-AGENT** | System monitoring dashboard | On-demand | Yes |

---

### UTILITY SKILLS (2 Skills) — Distribution & Tools

| # | Skill | Purpose | When |
|---|-------|---------|------|
| 18 | **X-TWITTER** | Post to Twitter/X | Publishing |
| 19 | **XURL** | URL shortening + tracking | Publishing |

---

## The 5-Step Pipeline (PILLAR-WORKFLOW)

```
User: "Pillar: RAG systems"
    ↓
STEP 1: RESEARCH-AGENT
├─ Reddit Scout → 15+ posts
├─ Twitter Scout → 10+ tweets
├─ YouTube Scout → 8+ videos
└─ Google News Scout → 5+ articles
    ↓
STEP 2-3: Status Updates
"✅ Research done! Generating ideas..."
    ↓
STEP 4: IDEA-GENERATOR (Subagent)
├─ Read research-report.md
├─ Read master-doc.md
└─ Output: 15 ideas with hooks + sources
    ↓
User Sees: "Here are 15 ideas. Which do you want to write?"
    ↓
User Selects: "2, 5, 9" (ideas) + "5x LinkedIn, 3x Twitter Threads"
    ↓
STEP 5: CONTENT CREATION LOOP
    For each format:
    ├─ CONTENT-PRODUCER writes draft
    ├─ VOICE-GUARDIAN validates
    │  └─ AI-HUMANIZER checks for AI patterns
    ├─ Send to user for approval
    └─ If rejected:
       ├─ REFLECTION-AGENT analyzes
       ├─ Updates voice-memory.json
       └─ CONTENT-PRODUCER retries
    
    ✅ If approved:
    └─ Move to next format
```

---

## Scout Folder Structure

```
skill-name/
├── SKILL.md                          ← Full docs
├── scripts/
│  ├── pipeline.js                    ← Main script
│  ├── [supporting scripts]
│  └── score.js                       ← Viral scoring
└── [niche]/
   └── runs/
      └── [timestamp]/
         ├── posts_ranked.json        ← Scored results
         ├── [detail].json            ← Full data + comments
         ├── cards/                   ← PNG cards
         ├── report.md                ← Human-readable
         └── chat.md                  ← Coordinator-friendly
```

---

## Key Files in Each Skill

### CORE SKILLS
```
dispatcher/
├── SKILL.md                    ← How dispatcher routes

onboarding/
├── SKILL.md                    ← Onboarding flow

pillar-workflow/
├── SKILL.md                    ← 5-step pipeline
├── scripts/run_research.sh     ← Scout runner (UPDATED TODAY ✅)
└── scripts/run_research_fixed.sh   ← Improved version

research-agent/
├── SKILL.md                    ← 4-scout orchestration

idea-generator/
├── SKILL.md                    ← Idea generation logic

content-producer/
├── SKILL.md                    ← 5 format writers

voice-guardian/
├── SKILL.md                    ← Validation checklist

reflection-agent/
├── SKILL.md                    ← Learning from feedback

ai-humanizer/
├── SKILL.md                    ← 12 AI pattern checks
```

### SCOUT SKILLS
```
reddit-scout/
├── SKILL.md
├── scripts/pipeline.js         ← Main scout script
├── scripts/relevance.js        ← Keyword filtering (FIXED TODAY ✅)
├── scripts/score.js            ← Viral score math
├── scripts/render_cards.js     ← PNG rendering
└── scripts/reddit_http.js      ← Rate-limited fetching

twitter-scout/
├── SKILL.md
├── scripts/pipeline.js
└── session.json                ← Saved Twitter session

youtube-scout/
├── SKILL.md
└── scripts/pipeline.js         ← Uses yt-dlp binary

google-news-scout/
├── SKILL.md
└── scripts/pipeline.js         ← Uses Google News RSS
```

---

## Parameters Cheat Sheet

### PILLAR-WORKFLOW
```bash
# User input:
"Pillar: AI finetuning"  # That's all!
```

### REDDIT SCOUT
```bash
--niche "RAG systems"
--topN 15              # Ideas to generate
--subLimit 10          # Max subreddits
--time week|month|all  # Timeframe
--kinds top,hot,rising # Listing types
--minSubscribers 10000 # Filter tiny subs
--searchAuto 1         # Auto-search
```

### TWITTER SCOUT
```bash
--query "AI careers"
--topN 10              # Number of tweets
```

### YOUTUBE SCOUT
```bash
--query "RAG tutorial"
--topN 8               # Number of videos
--searchN 20           # Search breadth
```

### GOOGLE NEWS SCOUT
```bash
--query "AI regulation"
--topN 10              # Number of articles
--daysBack 14          # How far back
```

---

## Data Flow

```
Telegram User Message
    ↓
DISPATCHER
├─ New user? → ONBOARDING → PILLAR-WORKFLOW
├─ Paid user? → PILLAR-WORKFLOW
└─ Unknown? → Payment gate
    ↓
PILLAR-WORKFLOW (User says "Pillar: [topic]")
    ├─ RESEARCH-AGENT (runs 4 scouts)
    │  ├─ REDDIT SCOUT → research-report.md
    │  ├─ TWITTER SCOUT ↓
    │  ├─ YOUTUBE SCOUT ↓
    │  └─ GOOGLE NEWS SCOUT ↓
    │
    ├─ IDEA-GENERATOR (reads research-report + master-doc)
    │  → 15 ideas with hooks + sources
    │
    ├─ User selects ideas + formats
    │
    └─ CONTENT-PRODUCER (writes)
       ├─ VOICE-GUARDIAN (validates)
       │  └─ AI-HUMANIZER (AI check)
       ├─ If FAIL → REFLECTION-AGENT (learns)
       └─ If PASS → Deliver to user
    
Optional Parallel:
├─ FEED-INTELLIGENCE (trending)
├─ COMPETITIVE-TRACKER (competitors)
└─ PERFORMANCE-TRACKER (metrics)
```

---

## Status of Today's Updates

✅ **reddit-scout/scripts/relevance.js**
- Fixed: Added TECH_EXCEPTIONS (RAG, AI, LLM, etc.)
- Impact: "RAG vs pageindex" now finds posts

✅ **reddit-scout/scripts/pipeline.js**
- Fixed: Updated keyword filter logic
- Impact: Tech-heavy niches now work

✅ **pillar-workflow/scripts/run_research.sh**
- Fixed: Added validation + auto-retry
- Impact: No more silent failures

---

## User Journey

### Day 1: New User
```
Telegram → DISPATCHER
→ ONBOARDING (collects master-doc)
→ User ready for pillars
```

### Day 2+: Content Creation
```
User: "Pillar: AI finetuning"
→ PILLAR-WORKFLOW starts
→ RESEARCH-AGENT (4 scouts run)
→ IDEA-GENERATOR (15 ideas)
→ User: "I want ideas 2, 5, 7"
→ CONTENT-PRODUCER (writes drafts)
→ VOICE-GUARDIAN (validates)
→ User approves/rejects
→ If rejects: REFLECTION-AGENT learns
→ Repeat until approved
→ All content delivered
```

### Day 30+: System Gets Smarter
```
- voice-memory.json grows
- Learned rules enforced
- System knows user's voice
- Less back-and-forth
- Faster production
```

---

## Why 4 Scouts?

Each platform has different content patterns:

| Platform | What's Unique | Why it matters |
|----------|-------------|---|
| **Reddit** | Deep discussions, threads, debates | Shows community sentiment + problems |
| **Twitter** | Hot takes, quick hooks, viral patterns | Shows what hooks work RIGHT NOW |
| **YouTube** | Long-form, tutorials, demos | Shows production quality + explanation style |
| **Google News** | Official sources, breaking news, analysis | Credibility + trending topics |

**Together:** 4 viewpoints = better ideas

---

## Troubleshooting

**"No Reddit posts found"**
→ Check: reddit-scout/scripts/relevance.js (keyword filter)
→ Check: Query too specific? (use "RAG systems" not "RAG vs pageindex alone")

**"Only 1 YouTube video"**
→ Check: Query too narrow? Run with `--searchN 50`
→ Check: Auto-retry logic in run_research.sh

**"Ideas don't match my voice"**
→ Check: voice-memory.json (learned rules)
→ Check: master-doc.md (voice definition)
→ Solution: REFLECTION-AGENT learns from rejections

**"Content violates my rules"**
→ Check: VOICE-GUARDIAN validation
→ Check: voice-memory.json rules are enforced
→ Problem: NEEDS FIXING (Phase 1 of learning system overhaul)

---

## Quick Navigation

- **Full skill map:** `/home/ubuntu/.openclaw/workspace/CONTENT_ENGINE_SKILLS_MAP.md`
- **Scout fixes:** `/home/ubuntu/.openclaw/workspace/REDDIT_SCOUT_FIX_FINAL.md`
- **Learning system:** `/home/ubuntu/.openclaw/workspace/CONTENT_ENGINE_LEARNING_SYSTEM_OVERHAUL.md`
- **Today's session:** `/home/ubuntu/.openclaw/workspace/2026-03-24-SESSION-SUMMARY.md`

