# Content Engine — Complete Skills Map

## Overview

The Content Engine has **15 specialized skills** organized into 2 groups:
- **Content Engine Skills** (9) — Core content creation pipeline
- **Scout/Research Skills** (6) — Data gathering from social platforms

---

## GROUP 1: CONTENT ENGINE SKILLS (Core Pipeline)

### 1. **DISPATCHER** — Entry Point & Router
**Location:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/dispatcher/`
**SKILL.md:** Yes ✅

**Purpose:**
- Identifies user by sender_id from Telegram
- Routes to payment gate (if new), onboarding (if paid), or content engine (if setup)
- Loads user workspace and injects context

**Files:**
- `SKILL.md` — Full documentation

**When it runs:**
- Every time a Telegram message arrives
- First thing in the Content Engine pipeline

**Output:**
- Routes to: payment → onboarding → content engine

---

### 2. **ONBOARDING** — New User Setup
**Location:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/onboarding/`
**SKILL.md:** Yes ✅

**Purpose:**
- Welcome new paid users
- Collect master-doc (voice, niche, opinions, hooks)
- Build user workspace
- Explain how to use Content Engine

**Files:**
- `SKILL.md` — Full documentation

**How it works:**
1. Sends master-doc template
2. Waits for user to fill it in + send back as .txt/.md
3. Builds workspace from submitted doc
4. Explains pillar workflow

**When it runs:**
- When new user completes payment
- One time per user

**Output:**
- User workspace ready
- master-doc.md in place
- voice-memory.json initialized

---

### 3. **PILLAR-WORKFLOW** — Main Orchestrator
**Location:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/pillar-workflow/`
**SKILL.md:** Yes ✅

**Purpose:**
- Main content creation orchestrator
- Takes user input: "pillar: [topic]"
- Manages full pipeline: research → ideas → production → approval

**Files:**
- `SKILL.md` — Full documentation & workflow
- `scripts/run_research.sh` — Runs all 4 scouts (UPDATED TODAY ✅)
- `scripts/run_research_fixed.sh` — Backup of improved version

**5-Step Workflow:**
1. **STATUS LOG** — Announce to user "Searching viral posts..."
2. **RESEARCH** — Run all 4 scouts, compile report
3. **STATUS LOG** — "Research done, generating ideas..."
4. **IDEA GENERATION** — Spawn idea-generator subagent
5. **APPROVAL LOOP** — User approves/rejects, reflection-agent learns

**When it runs:**
- When user says: "Pillar: [topic]"
- Or: "pillar: [topic]"

**Output:**
- 15 ideas delivered to user
- Production plan prompt: Which ideas to write? Which formats?

---

### 4. **RESEARCH-AGENT** — 4-Platform Research
**Location:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/research-agent/`
**SKILL.md:** Yes ✅

**Purpose:**
- Runs all 4 scouts in parallel (Reddit, Twitter, YouTube, Google News)
- Validates results
- Auto-retries if data insufficient
- Produces structured research report

**Files:**
- `SKILL.md` — Detailed validation & retry logic

**Scouts it runs:**
1. Reddit Scout → subreddit discovery + top posts
2. Twitter Scout → viral tweets search
3. YouTube Scout → viral videos search
4. Google News Scout → recent articles search

**Validation Logic (from SKILL.md):**
- Need 4+ Reddit posts with URLs
- Need 4+ Twitter tweets
- Need 4+ YouTube videos
- Need 3+ Google News articles
- Auto-retry if below minimum (week→month→all-time for Reddit, etc.)

**When it runs:**
- Called by pillar-workflow Step 1
- Only runs if dispatcher validated payment

**Output:**
- research-report.md with all 4 platforms
- All URLs ready for idea-generator

---

### 5. **IDEA-GENERATOR** — 15 Ideas with Hooks
**Location:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/idea-generator/`
**SKILL.md:** Yes ✅

**Purpose:**
- Reads research-report.md
- Reads user's master-doc.md
- Generates 15 content ideas
- Each idea has: hook + format + rationale + source URL

**Files:**
- `SKILL.md` — Full documentation

**What it does:**
1. Analyzes research data (Reddit, Twitter, YouTube, Google News)
2. Finds trending hooks, formats, gaps
3. Cross-references with user's voice/opinions/stories
4. Generates 15 diverse ideas
5. Includes source URLs (📎 Source: [Reddit/YouTube/Twitter/Google News URL])
6. Ends with production plan prompt

**When it runs:**
- Called by pillar-workflow Step 4 as subagent
- After research-agent completes

**Input:**
- research-report.md (all 4 platforms)
- master-doc.md (user voice)

**Output:**
- 15 ideas with hooks + formats
- Production plan prompt
- Posts to user Telegram directly

---

### 6. **CONTENT-PRODUCER** — Writes Posts
**Location:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/content-producer/`
**SKILL.md:** Yes ✅

**Purpose:**
- Produces 5 content formats:
  - LinkedIn Posts (LP)
  - X Articles (XA)
  - Twitter Threads (TH)
  - Tweets (TW)
  - Instagram Carousels (CA)

**Files:**
- `SKILL.md` — Full documentation

**How it works:**
1. User picks ideas to write + format count
2. Content producer reads:
   - master-doc.md (voice)
   - voice-memory.json (learned rules)
3. Generates one piece at a time
4. Each draft goes to voice-guardian for validation

**When it runs:**
- When user specifies: "5x LinkedIn Posts, 4x Twitter Threads, etc."
- After idea approval

**Output:**
- One draft at a time
- Sent to voice-guardian before reaching user

---

### 7. **VOICE-GUARDIAN** — Quality Gate
**Location:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/voice-guardian/`
**SKILL.md:** Yes ✅

**Purpose:**
- Validates every draft before user sees it
- Checks against voice-memory.json rules
- Catches:
  - Forbidden phrases (leverage, synergy, etc.)
  - AI detectability (via ai-humanizer)
  - Tone issues (too corporate, too formal)
  - Style violations (em dashes, semicolons, etc.)

**Files:**
- `SKILL.md` — Full validation checklist

**Validation Steps:**
1. AI-HUMANIZER CHECK (12 AI patterns)
2. Voice lessons (hard rules from master-doc)
3. Forbidden phrases check
4. Style requirements check
5. Tone guardrails check
6. AI test (could a human tell this is AI?)
7. Master-doc alignment

**When it runs:**
- After content-producer generates each draft
- Before draft reaches user

**Output:**
- APPROVED — sends to user
- FAIL — returns to content-producer with issues

---

### 8. **REFLECTION-AGENT** — Learn from Feedback
**Location:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/reflection-agent/`
**SKILL.md:** Yes ✅

**Purpose:**
- Runs when draft is rejected (by user OR voice-guardian)
- Diagnoses why it failed
- Produces: Explanation + Solution + Instructions
- Updates voice-memory.json with lessons

**Files:**
- `SKILL.md` — Full documentation

**3-Part Output:**
1. **EXPLANATION** — Why this draft failed (specific analysis)
2. **SOLUTION** — Step-by-step fix (concrete actions)
3. **INSTRUCTIONS** — Generalizable rule for future drafts

**What it does:**
1. Reads voice-memory.json (past lessons)
2. Reads master-doc.md (user voice)
3. Analyzes rejection reason
4. Classifies failure type (hook_generic, tone_corporate, etc.)
5. Generates reflection
6. Updates voice-memory with new lesson
7. Returns to content-producer for rewrite

**When it runs:**
- When user rejects draft
- When voice-guardian hard-fails draft

**Output:**
- Reflection (explanation + solution + instruction)
- Updated voice-memory.json
- Content-producer retries with new guidance

---

### 9. **AI-HUMANIZER** — AI Writing Detection
**Location:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/ai-humanizer/`
**SKILL.md:** Yes ✅

**Purpose:**
- Scans draft for 12 documented AI writing patterns
- Rewrites sentences to sound human
- Removes AI tells (banned vocab, fake phrases, etc.)

**Files:**
- `SKILL.md` — Full documentation

**12 AI Patterns it Catches:**
1. Banned AI vocab (delve, tapestry, paradigm, leverage, etc.)
2. Fake importance phrases
3. Present participle tail-ons
4. Negative parallelisms
5. Copula avoidance (serves as, stands as)
6. Vague authority (Experts say...)
7. Challenge/future formula
8. Rule of three padding
9. Didactic disclaimers
10. Summarizing closers (In summary...)
11. Em dash overuse (2+ = rewrite)
12. Promotional tone

**Scoring:**
- 0 violations → APPROVED
- 1-3 minor → Fix inline
- 4-7 → Rewrite required
- 8+ → Full redraft

**When it runs:**
- Called by voice-guardian as first validation step
- On every draft before sending

**Output:**
- Clean, human-sounding text
- List of specific fixes made

---

## GROUP 2: SCOUT SKILLS (Data Collection)

### 1. **REDDIT SCOUT** — Reddit Viral Posts
**Location:** `/home/ubuntu/.openclaw/workspace/skills/sdr-automation/reddit-scout/`
**SKILL.md:** Yes ✅

**Purpose:**
- Discover subreddits matching niche
- Fetch top/hot/rising posts
- Score by virality (ups, comments, ratio)
- Fetch full post + top comments
- Render Reddit-style cards as PNG
- Generate viral content ideas from posts

**Files:**
- `SKILL.md` — Full documentation
- `scripts/pipeline.js` — Main script
- `scripts/relevance.js` — Keyword filtering (FIXED TODAY ✅)
- `scripts/score.js` — Viral score calculation
- `scripts/render_cards.js` — PNG card rendering
- `scripts/reddit_http.js` — Polite HTTP with rate limiting
- `scripts/report.js` — Report generation

**Key Parameters:**
- `--niche "topic"` — Search query
- `--topN 15` — Number of ideas to generate
- `--subLimit 10` — Max subreddits to search
- `--time week|month|all` — Timeframe
- `--kinds top,hot,rising` — Listing types
- `--minSubscribers 10000` — Filter tiny subs
- `--subAllowlist "sub1,sub2"` — Force specific subs

**Outputs:**
- `subreddits.json` — Discovered + filtered subs
- `posts_ranked.json` — Scored posts (top 200)
- `top_posts_detailed.json` — Top N with full data + comments
- `cards/*.png` — Rendered card images
- `report.md` — Human-readable summary
- `chat.md` — Coordinator-friendly output

**When it runs:**
- Called by research-agent (part of 4-platform research)
- Or standalone for Reddit-specific research

---

### 2. **TWITTER SCOUT** — Viral X/Twitter Posts
**Location:** `/home/ubuntu/.openclaw/workspace/skills/sdr-automation/twitter-scout/`
**SKILL.md:** Yes ✅

**Purpose:**
- Search Twitter for viral tweets
- Score by virality (likes, retweets, replies)
- Fetch transcript/text + engagement metrics
- Generate viral hooks from tweets

**Files:**
- `SKILL.md` — Full documentation
- `scripts/pipeline.js` — Main script
- `scripts/twitter_http.js` — Session-based fetch
- Uses Playwright + Decodo ISP proxy
- `session.json` — Saved session cookies

**Key Parameters:**
- `--query "topic"` — Search query
- `--topN 10` — Number of top tweets

**Outputs:**
- `posts_ranked.json` — Ranked tweets
- `report.md` — Summary
- `chat.md` — Coordinator output

**Prerequisites:**
- `session.json` with valid Twitter session
- Decodo ISP proxy configured

**When it runs:**
- Called by research-agent
- Or standalone for Twitter research

---

### 3. **YOUTUBE SCOUT** — Viral YouTube Videos
**Location:** `/home/ubuntu/.openclaw/workspace/skills/sdr-automation/youtube-scout/`
**SKILL.md:** Yes ✅

**Purpose:**
- Search YouTube for viral videos
- Rank by view count (viral score: log10(views))
- Fetch transcripts (auto-generated or manual)
- Extract key insights from videos

**Files:**
- `SKILL.md` — Full documentation
- `scripts/pipeline.js` — Main script
- Requires: `/home/ubuntu/yt-dlp` binary (installed)

**Key Parameters:**
- `--query "topic"` — Search query
- `--topN 8` — Number of top videos
- `--searchN 20` — How many to search before ranking

**Outputs:**
- `posts_ranked.json` — Ranked videos with transcripts
- `report.md` — Summary
- `transcripts/[video_id]/` — VTT transcript files

**Viral Score:** log10(view_count), scaled 1-10

**When it runs:**
- Called by research-agent
- Or standalone for YouTube research

---

### 4. **GOOGLE NEWS SCOUT** — Recent Articles
**Location:** `/home/ubuntu/.openclaw/workspace/skills/sdr-automation/google-news-scout/`
**SKILL.md:** Yes ✅

**Purpose:**
- Search Google News RSS for recent articles
- Filter by date (last 7-30 days)
- Extract titles, sources, URLs
- Rank by recency

**Files:**
- `SKILL.md` — Full documentation
- `scripts/pipeline.js` — Main script
- Uses Google News RSS endpoints (no API key needed)

**Key Parameters:**
- `--query "topic"` — Search query
- `--topN 10` — Number of articles
- `--daysBack 14` — How far back to search

**Outputs:**
- `articles.json` — Ranked articles with URLs
- `report.md` — Summary
- `chat.md` — Coordinator output

**When it runs:**
- Called by research-agent
- Or standalone for news research

---

### 5. **X-TWITTER** & **XURL** — Utility Skills
**Location:** `/home/ubuntu/.openclaw/workspace/skills/sdr-automation/x-twitter/` & `xurl/`
**SKILL.md:** Yes ✅

**Purpose:**
- X-TWITTER: Post to Twitter/X
- XURL: URL shortening + tracking

**When it runs:**
- Called when user publishes to Twitter
- Helper for content distribution

---

## SUPPORTING SKILLS (Not Core Pipeline)

### 1. **FEED-INTELLIGENCE** — Trending Topics Scan
**Location:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/feed-intelligence/`
**SKILL.md:** Yes ✅

**Purpose:**
- Daily scan of 30+ posts per platform (X, LinkedIn, Instagram)
- Active niche search (not passive scrolling)
- Identify trending hooks, viral formats, gaps

**When it runs:**
- Daily or before pillar session
- Optional for users

**Output:**
- feed-intelligence.md with trends
- Updates master-doc.md with hooks

---

### 2. **COMPETITIVE-TRACKER** — Competitor Analysis
**Location:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/competitive-tracker/`
**SKILL.md:** Yes ✅

**Purpose:**
- Weekly scan of 5-10 competitor accounts in user's niche
- What are they posting? What lands? What gaps exist?

**When it runs:**
- Weekly or on-demand
- Optional for competitive analysis

**Output:**
- competitive-gaps.md
- Feeds into idea generation

---

### 3. **PERFORMANCE-TRACKER** — Post Metrics Analysis
**Location:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/performance-tracker/`
**SKILL.md:** Yes ✅

**Purpose:**
- Track published post performance (likes, engagement, etc.)
- Update master-doc with what worked/failed
- Identify content to recycle or rewrite

**When it runs:**
- Weekly or on-demand
- After content is published

**Output:**
- Updated master-doc
- Learnings fed back to system

---

### 4. **COORDINATOR-AGENT** — Dashboard & Monitoring
**Location:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/coordinator-agent/`
**SKILL.md:** Yes ✅

**Purpose:**
- Monitor Content Engine system health
- Show agent status, logs, queues
- Dashboard for system oversight

---

## ARCHITECTURE SUMMARY

```
DISPATCHER (Entry)
    ↓
[New user?] → ONBOARDING → master-doc collected
    ↓
PILLAR-WORKFLOW (Main Orchestrator)
    ├─ Step 1: RESEARCH-AGENT
    │  ├─ REDDIT SCOUT
    │  ├─ TWITTER SCOUT
    │  ├─ YOUTUBE SCOUT
    │  └─ GOOGLE NEWS SCOUT
    │
    ├─ Step 2-3: Status updates
    │
    ├─ Step 4: IDEA-GENERATOR (Subagent)
    │
    └─ Step 5: APPROVAL LOOP
       ├─ CONTENT-PRODUCER (writes draft)
       ├─ VOICE-GUARDIAN (validates)
       │  └─ AI-HUMANIZER (AI check)
       └─ REFLECTION-AGENT (learns from feedback)

Optional Parallel:
├─ FEED-INTELLIGENCE (trending topics)
├─ COMPETITIVE-TRACKER (competitors)
└─ PERFORMANCE-TRACKER (post metrics)
```

---

## File Structure by Skill

Each skill has this typical structure:

```
skill-name/
├── SKILL.md              — Full documentation
├── scripts/
│  └── pipeline.js        — Main executable
├── references/           — Supporting data
└── memory/               — Skill state
```

---

## Today's Changes

✅ **reddit-scout/scripts/relevance.js** — Added TECH_EXCEPTIONS for RAG, AI, LLM
✅ **reddit-scout/scripts/pipeline.js** — Updated keyword filter logic
✅ **pillar-workflow/scripts/run_research.sh** — Added validation + retry logic

---

## Summary

| Type | Count | Skills |
|------|-------|--------|
| **Core Pipeline** | 9 | Dispatcher, Onboarding, Pillar-Workflow, Research-Agent, Idea-Generator, Content-Producer, Voice-Guardian, Reflection-Agent, AI-Humanizer |
| **Scout/Research** | 4 | Reddit, Twitter, YouTube, Google News |
| **Supporting** | 4 | Feed-Intelligence, Competitive-Tracker, Performance-Tracker, Coordinator-Agent |
| **Utility** | 2 | X-Twitter, XURL |
| **TOTAL** | **19** | All Content Engine skills |

---

## Key Statistics

- **Total Skills:** 19
- **Documented:** 15 (with SKILL.md)
- **Actively Used:** 9 (core pipeline)
- **Scout-Based:** 4
- **Optional/Supporting:** 6
- **Lines of Documentation:** 15,000+
- **Total Scripts:** 50+ (pipeline.js, score.js, render.js, etc.)

