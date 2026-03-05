---
name: coordinator-agent
description: Single comprehensive agent that runs research (via reddit-scout), trend analysis, competitive audit, and performance review sequentially in one session. Merges into strategic brief and generates 15 ideas. Called by pillar-workflow on every Pillar: [topic] trigger.
---

# Coordinator Agent — Single-Session Intelligence Orchestrator

Runs all 4 intelligence streams sequentially (no sub-agents), merges findings, generates 15 ideas.

## Trigger

Spawned by `pillar-workflow` when trigger `Pillar: [topic]` is received.

## Chat Format During Run

You are running inside a live chat. Send progress updates as you go — one message per step.
Use the timestamp format `[M/D/YYYY H:MM AM/PM]` from the current time (get via session_status).

Follow the **Chat Format Layer** in `pillar-workflow/SKILL.md` for all message templates:
- Research phase → send timestamped live update messages
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

Send live updates as the scout runs (use Chat Format timestamps):
```
[timestamp] Discovering subreddits... fetching posts...
[timestamp] Scanning r/[Sub1], r/[Sub2], r/[Sub3]...
[timestamp] Scanning r/[Sub4], r/[Sub5]... Running global search...
[timestamp] Found r/[DiscoveredSub]... Scoring posts...
[timestamp] Fetching detailed post data... Almost done...
[timestamp] Found [N] high-signal posts... Generating report...
[timestamp] ✅ Reddit-scout complete! Reading report...
[timestamp] Perfect insights! Now generating [N] viral ideas...
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

### STEP 2 — Web + Industry Research (SECONDARY)

Supplement reddit-scout data with:
- **Google News / Web:** `[pillar topic] 2026`, recent articles past 2 weeks
- **Viral angles:** `[pillar topic] controversial opinion`, `[pillar topic] unpopular take`

Extract: stats, data points, industry reports, trending angles missing from Reddit.

---

### STEP 3 — Trend Psychology Analysis

Analyze combined research (reddit-scout + web). Extract:
- Which emotional archetypes are working RIGHT NOW (fear, anger, curiosity, vulnerability, inspiration)?
- What hook structures repeat across viral posts?
- Which emotional triggers are oversaturated?
- What emotional angle is completely empty right now?

---

### STEP 4 — Competitive Audit

- Check `/home/ubuntu/.openclaw/workspace/content-queue.md` — what has Ayush already posted on similar topics?
- Identify: What worked? What underperformed?
- Extract: Where are the narrative gaps? What angle is nobody owning?

---

### STEP 5 — Performance Pattern Recognition

- Read `master-doc.md` + `content-queue.md` for Ayush's published content history
- Extract: Which formats perform best for him? (LinkedIn vs X vs Thread vs Carousel)
- Which hook styles convert highest?
- Correlate with emotional archetypes from Step 3

---

### STEP 6 — Strategic Synthesis

Merge all findings into ONE strategic brief and save to:
`/home/ubuntu/.openclaw/workspace/strategic-brief-[topic-slug]-[date].md`

```
## STRATEGIC BRIEF — [Topic] — [Date]

### What Reddit Shows (from reddit-scout)
[Top pain points, debates, viral patterns — with real subreddit sources]

### Web/Industry Layer
[Key data points, recent angles, missing from Reddit]

### Emotional Patterns That Work
[Which emotions/archetypes are winning right now]

### What Ayush Has Already Covered
[Past posts + what worked/underperformed]

### Strategic Recommendation
[The angle Ayush should own, the format that will convert best, why now]
```

---

### STEP 7 — Generate 15 Ideas

Using: strategic brief + reddit-scout top posts + master-doc.md + voice-memory.json

Each idea must include:
- **Hook:** Exact opening line (conversational, specific — derived from real Reddit post patterns)
- **Angle:** One-line tension or take
- **Format fit:** LinkedIn / X Article / Thread / Tweet / Carousel
- **Source:** Which Reddit post or web finding inspired this idea (include subreddit + upvotes if Reddit)
- **Viral Score:** Estimate 1-10 based on reddit-scout viral scores of source posts
- **Why now:** Tie to strategic brief

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
   - `agent_logs.research_agent.sources_checked = ["reddit-scout", "web_search", ...]`
   - `agent_logs.research_agent.topics_covered = [pillar topic]`

---

## Output Format

Use the **Chat Format Layer** from `pillar-workflow/SKILL.md` exactly.

Ideas output format (zero-padded, sorted by viral score):
```
[timestamp] 💡 15 VIRAL IDEAS — [Pillar Topic]

Source: 🔴 Reddit ([X] viral posts analyzed)


Idea 01: [Title]

Source: 🔴 Reddit (r/[subreddit], [upvotes] upvotes)
Hook: "[exact hook line]"
Viral Score: [X]/10

Idea 02: [Title]

Source: 🔴 Reddit (r/[subreddit], [upvotes] upvotes)
Hook: "[exact hook line]"
Viral Score: [X]/10

[... through Idea 15]


🎯 Top 5 Recommended

1. Idea [N] ([score]/10) - [short label]
2. Idea [N] ([score]/10) - [short label]
3. Idea [N] ([score]/10) - [short label]
4. Idea [N] ([score]/10) - [short label]
5. Idea [N] ([score]/10) - [short label]

Pick idea + format to start production.

Format codes:

• LP = LinkedIn Post
• TH = Twitter Thread
• XA = X Article (long-form)
• TW = Single Tweet
• CA = Instagram Carousel
Example: 1, LP or 3, XA or 5, TH
```

---

## Voice Rules Baked In

- Everything you write reflects Ayush's voice (from master-doc.md)
- Respect forbidden phrases (from voice-memory.json)
- No corporate jargon, no filler words
- Ideas are grounded in real Reddit signal — not generic AI takes
