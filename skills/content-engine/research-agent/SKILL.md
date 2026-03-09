---
name: research-agent
description: >
  Research agent for the Content Engine. Triggers when a pillar is set.
  Runs BOTH reddit-scout AND twitter-scout in parallel for the given topic.
  Returns a structured research report: trending topics, viral formats, hook styles
  working right now, content gaps nobody is filling.
  Use before running idea-generator. Works for any user — replace Ayush references
  with the current USER_NAME and USER_WORKSPACE from dispatcher context.
---

# Research Agent

Scans Reddit + Twitter/X for a given content pillar and returns a structured dual-platform report.

## Multi-User Context

This skill is user-agnostic. When called, the dispatcher injects:
- `{USER_NAME}` — the current user's name
- `{USER_WORKSPACE}` — path like `/home/ubuntu/.openclaw/workspace/users/{telegram_id}/`
- `{USER_NICHE}` — from their master-doc

Always read the user's master-doc for context:
`{USER_WORKSPACE}master-doc.md`
Focus on: **Niche**, **Core Opinions & Angles**, **What's Already Posted**

## Trigger
- Pillar is set: user says `pillar: [topic]` or pillar-workflow kicks this off
- Explicit: `research [topic]`

## Always Announce Before Running

Before running any scout, send this message to the user:
```
🔍 Starting research on: [Pillar Topic]

Scanning Reddit + Twitter/X for what's viral around this right now — top posts, hot takes, pain points, and gaps.

This usually takes 5-7 minutes. I'll send the full report + 15 ideas when it's ready. Hang tight...
```

After Reddit scout completes, send: `✅ Reddit done. Now scanning Twitter/X...`
After both complete, send: `✅ Both scouts done. Compiling report + ideas now...`

---

## Research Sources

### 1. Reddit Scout

Run the reddit-scout pipeline:

```bash
node /home/ubuntu/.openclaw/workspace/skills/reddit-scout/scripts/pipeline.js \
  --niche "[pillar topic + user niche keywords]" \
  --out "/home/ubuntu/.openclaw/workspace/reddit-scout" \
  --topN 10 --subLimit 8 --gapMs 1200 \
  --time week --kinds top,hot,rising \
  --searchAuto 1 --printChat 1
```

Key subreddits for tech/AI/career content:
- r/MachineLearning, r/cscareerquestions, r/datascience
- r/entrepreneur, r/learnmachinelearning, r/artificial, r/mcp

Look for: posts with 100+ upvotes, threads with debate, pain points people vent about.

---

### 2. Twitter Scout

Run the twitter-scout pipeline (Playwright + stealth + saved session):

```bash
node /home/ubuntu/.openclaw/workspace/skills/twitter-scout/scripts/pipeline.js \
  --query "[pillar topic] AI 2026" \
  --out "/home/ubuntu/.openclaw/workspace/twitter-scout" \
  --topN 10 \
  --printChat
```

Session file: `/home/ubuntu/.openclaw/workspace/skills/twitter-scout/session.json`

If session expired (script exits with "Session expired"):
- Notify user: "Twitter session needs refresh — please re-export cookies to session.json"
- Continue with Reddit data only, note the gap in the report

Look for: viral tweets, hot takes, controversial threads, format styles getting engagement.

---

### 3. Run Both in Parallel

Always run BOTH scouts. Use `exec` with background or run sequentially — do not skip either.
Combine results into a single research report.

---

## Output Format: Research Report

```
## RESEARCH REPORT — [Pillar Topic]
User: {USER_NAME} | Date: [today]

### 1. What People Are Talking About
[3-5 bullet points: top pain points, questions, debates from Reddit + Twitter]

### 2. Trending Angles / Hot Takes
[3-4 angles generating engagement — note source platform]

### 3. Hook Styles Working Right Now
[2-3 hook patterns with traction — e.g. "builder confession", "one weird trick", "controversial stat"]

### 4. Content Gaps (Nobody Is Filling These)
[2-3 angles underserved on both platforms]

### 5. {USER_NAME}'s Natural Angle
[1-2 sentences: where does this user's story/experience/opinions intersect with what's trending?]

### Sources
Reddit top posts: [list with URLs]
Twitter top tweets: [list with URLs]
```

After producing the report, immediately pass to idea-generator (or wait for pillar-workflow handoff).
