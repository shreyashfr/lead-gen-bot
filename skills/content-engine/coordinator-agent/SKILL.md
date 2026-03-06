---
name: coordinator-agent
description: Single comprehensive agent that runs research (via reddit-scout + xurl Twitter intelligence), trend analysis, competitive audit, and performance review sequentially in one session. Merges into strategic brief and generates 15 ideas. Called by pillar-workflow on every Pillar: [topic] trigger.
---

# Coordinator Agent — Single-Session Intelligence Orchestrator

Runs all 4 intelligence streams sequentially (no sub-agents), merges findings, generates 15 ideas.

## Trigger

Spawned by `pillar-workflow` when trigger `Pillar: [topic]` is received.

## Chat Format During Run

You are running inside a live chat. Send progress updates as you go — one message per step.
No timestamps in messages.

Follow the **Chat Format Layer** in `pillar-workflow/SKILL.md` for all message templates:
- Research phase → send plain live update messages (no timestamps)
- Ideas output → use the zero-padded Ideas Output format (Idea 01...15)

---

## Your Mission

You are the intelligence coordinator for the pillar: `[TOPIC]`

---

### STEP 1 — Reddit Deep Dive (PRIMARY via reddit-scout)

**reddit-scout is the PRIMARY research source.** Run it first, before any web search.

```bash
node /home/ubuntu/.openclaw/workspace/skills/reddit-scout/scripts/pipeline.js \
  --niche "[pillar topic]" \
  --out "/home/ubuntu/.openclaw/workspace/reddit-scout" \
  --topN 10 --subLimit 8 --gapMs 1200 \
  --time week --kinds top,hot,rising \
  --searchAuto 1 --printChat 1
```

Send live updates as the scout runs:
```
Discovering subreddits... fetching posts...
Scanning r/[Sub1], r/[Sub2], r/[Sub3]...
Scanning r/[Sub4], r/[Sub5]... Running global search...
Found r/[DiscoveredSub]... Scoring posts...
Fetching detailed post data... Almost done...
Found [N] high-signal posts... Generating report...
✅ Reddit-scout complete! Reading report...
Perfect insights! Now generating [N] viral ideas...
```

After scout completes, read the output:
- `/home/ubuntu/.openclaw/workspace/reddit-scout/[niche-slug]/runs/[latest]/report.md`
- `/home/ubuntu/.openclaw/workspace/reddit-scout/[niche-slug]/runs/[latest]/top_posts_detailed.json`

Extract from reddit-scout output:
- Top subreddits found (real names from the scan)
- Viral posts (title, subreddit, upvote count, hook patterns)
- Top comments (pain points, debates, what people are actually saying)
- Viral scores for each post (carry these into idea generation)

**Fallback (only if reddit-scout fails/unavailable):**
Use `web_search` queries:
- `site:reddit.com [pillar topic] 2026`
- `site:reddit.com [pillar topic] career site:reddit.com`

---

### STEP 2 — Twitter Viral Research via twitter-scout (SECONDARY — runs after Reddit)

**twitter-scout** is the Twitter/X equivalent of reddit-scout. Uses Playwright + saved session cookies to scrape real viral tweets with full engagement metrics.

**How to run:**

```bash
node /home/ubuntu/.openclaw/workspace/skills/twitter-scout/scripts/pipeline.js \
  --query "[pillar topic]" \
  --out "/home/ubuntu/.openclaw/workspace/twitter-scout" \
  --topN 10 --printChat
```

After it completes, read the outputs:
- `/home/ubuntu/.openclaw/workspace/twitter-scout/[slug]/runs/[latest]/report.md`
- `/home/ubuntu/.openclaw/workspace/twitter-scout/[slug]/runs/[latest]/top_posts_detailed.json`

**Extract from the report:**
- **Hook line** — exact opening line of each viral tweet
- **Core angle** — the tension or take driving engagement
- **Emotional trigger** — fear / anger / curiosity / vulnerability / aspiration
- **Engagement** — likes, retweets, replies, bookmarks (real numbers)
- **Viral score** — pre-calculated 1–10 score in the report

**Output: Twitter Viral Signals block:**
```
## Twitter Viral Signals — [Pillar Topic]

Post 1: "[tweet text]"
Author: [name] ([handle])
Engagement: ❤️ [likes]  🔁 [rts]  💬 [replies]
Viral Score: [X]/10
URL: [url]

[up to 5 posts]
```

**Send a live update after this step:**
```
✅ Twitter-scout complete! [N] viral tweets found, top: "[hook]" (score [X])...
Now running web research + trend psychology...
```

**Fallback (if twitter-scout fails):**
Skip silently and note in strategic brief: "Twitter layer unavailable — relied on Reddit + web."

---

### STEP 3 — Web + Industry Research (TERTIARY)

Supplement reddit-scout + xurl data with:
- **Google News / Web:** `[pillar topic] 2026`, recent articles past 2 weeks
- **Viral angles:** `[pillar topic] controversial opinion`, `[pillar topic] unpopular take`

Extract: stats, data points, industry reports, trending angles missing from Reddit and Twitter.

---

### STEP 4 — Trend Psychology Analysis

Analyze combined research (reddit-scout + xurl + web). Extract:
- Which emotional archetypes are working RIGHT NOW (fear, anger, curiosity, vulnerability, inspiration)?
- What hook structures repeat across viral posts?
- Which emotional triggers are oversaturated?
- What emotional angle is completely empty right now?

---

### STEP 5 — Competitive Audit

- Check `/home/ubuntu/.openclaw/workspace/content-queue.md` — what has Ayush already posted on similar topics?
- Identify: What worked? What underperformed?
- Extract: Where are the narrative gaps? What angle is nobody owning?

---

### STEP 6 — Performance Pattern Recognition

- Read `master-doc.md` + `content-queue.md` for Ayush's published content history
- Extract: Which formats perform best for him? (LinkedIn vs X vs Thread vs Carousel)
- Which hook styles convert highest?
- Correlate with emotional archetypes from Step 4

---

### STEP 7 — Strategic Synthesis

Merge all findings into ONE strategic brief and save to:
`/home/ubuntu/.openclaw/workspace/strategic-brief-[topic-slug]-[date].md`

```
## STRATEGIC BRIEF — [Topic] — [Date]

### What Reddit Shows (from reddit-scout)
[Top pain points, debates, viral patterns — with real subreddit sources]

### What Twitter Shows (from xurl)
[Top viral posts, hooks, engagement signals — same format as Reddit section]

### Web/Industry Layer
[Key data points, recent angles, missing from Reddit and Twitter]

### Emotional Patterns That Work
[Which emotions/archetypes are winning right now]

### What Ayush Has Already Covered
[Past posts + what worked/underperformed]

### Strategic Recommendation
[The angle Ayush should own, the format that will convert best, why now]
```

---

### STEP 8 — Generate 15 Ideas

Using: strategic brief + reddit-scout viral posts + xurl Twitter viral posts + master-doc.md + voice-memory.json

Each idea must include:
- **Hook:** Exact opening line (conversational, specific — derived from a real Reddit post or Twitter post pattern)
- **Angle:** One-line tension or take
- **Format fit:** LinkedIn / X Article / Thread / Tweet / Carousel
- **Source:** Which post inspired it — `🔴 Reddit (r/[sub], [upvotes] upvotes)` OR `🐦 Twitter ([hook preview], viral score [X])`
- **Viral Score:** Carry forward from reddit-scout or xurl viral score of the source post
- **Why now:** Tie to strategic brief

**Ideas sourced from Twitter (xurl) are equal weight to Reddit ideas — mix them freely. Best signal wins.**

**Sort ideas by Viral Score descending before outputting.**

---

## Memory Management

Before you start:
1. Read `/home/ubuntu/.openclaw/workspace/master-doc.md` (voice, stories, positioning)
2. Read `/home/ubuntu/.openclaw/workspace/voice-memory.json` (rules, high performers, tone guardrails)
3. Check `voice-memory.json → agent_logs.research_agent.sources_checked` — don't rescan same sources from past 24h

After you finish:
1. Log to voice-memory.json:
   - `agent_logs.research_agent.last_run = today`
   - `agent_logs.research_agent.sources_checked = ["reddit-scout", "xurl-twitter", "web_search", ...]`
   - `agent_logs.research_agent.topics_covered = [pillar topic]`

---

## Output Format

### STEP A — Save full ideas to file FIRST

Before sending anything to chat, save the complete detailed brief (all 15 ideas with full angle, story, format fit, why now) to:
`/home/ubuntu/.openclaw/workspace/content-engine/pending-ideas.md`

Format in that file:
```
# IDEAS REPORT — [Pillar Topic] — [Date]

## Idea 01: [Title]
Source: 🔴 Reddit (r/[subreddit], [upvotes] upvotes)
Hook: "[exact hook line]"
Angle: [full angle]
Best for: [formats]
Story: [story reference]
Why now: [why now]
Viral Score: [X]/10

[... all 15 ideas in full detail ...]
```

### STEP B — Send CONDENSED version to chat

After saving to file, send a SHORT chat message (Telegram-safe, under 3500 chars total):

```
💡 IDEAS — [Pillar Topic]

01 ([score]/10) — [Title]
Hook: "[hook]"

02 ([score]/10) — [Title]
Hook: "[hook]"

03 ([score]/10) — [Title]
Hook: "[hook]"

04 ([score]/10) — [Title]
Hook: "[hook]"

05 ([score]/10) — [Title]
Hook: "[hook]"

06 ([score]/10) — [Title]
Hook: "[hook]"

07 ([score]/10) — [Title]
Hook: "[hook]"

08 ([score]/10) — [Title]
Hook: "[hook]"

09 ([score]/10) — [Title]
Hook: "[hook]"

10 ([score]/10) — [Title]
Hook: "[hook]"

11 ([score]/10) — [Title]
Hook: "[hook]"

12 ([score]/10) — [Title]
Hook: "[hook]"

13 ([score]/10) — [Title]
Hook: "[hook]"

14 ([score]/10) — [Title]
Hook: "[hook]"

15 ([score]/10) — [Title]
Hook: "[hook]"

Full details saved to pending-ideas.md

Reply with idea number + format (e.g. 3, LP or 7, XA)
Formats: LP LinkedIn · TH Thread · XA X Article · TW Tweet · CA Carousel
```

**CRITICAL:** The condensed chat message must stay under 3500 characters total. Hook lines should be max 100 chars each — truncate with "..." if needed. Title max 60 chars.

---

## Voice Rules Baked In

- Everything you write reflects Ayush's voice (from master-doc.md)
- Respect forbidden phrases (from voice-memory.json)
- No corporate jargon, no filler words
- Ideas are grounded in real Reddit signal — not generic AI takes
