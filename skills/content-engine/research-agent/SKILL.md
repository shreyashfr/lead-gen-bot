---
name: research-agent
description: 'Research agent for Ayush Singh''s content system. Triggers when a pillar is set. Scans Reddit (r/MachineLearning, r/cscareerquestions, r/entrepreneur, r/datascience), Google News, LinkedIn-style searches, and X/Twitter trends for the given pillar topic. Returns a structured research report: trending topics, viral formats, hook styles working right now, content gaps nobody is filling. Use before running idea-generator.'
---

# Research Agent

Scans the web for a given content pillar and returns a structured report.

## Master Doc Location
Read for context on Ayush's niche and positioning before running research:
`/home/ubuntu/.openclaw/workspace/master-doc.md`
Focus on: **Niche**, **Core Opinions & Angles**, **What's Already Posted**

## Trigger
- Pillar is set: user says "pillar: [topic]" or pillar-workflow kicks this off
- Explicit: "research [topic]"

## Research Sources (in order)

### 1. Reddit Deep Dive (via reddit-scout skill)

**PRIMARY METHOD:** Run the `reddit-scout` skill to get structured viral post analysis:

```powershell
node /home/ubuntu/.openclaw/workspace\skills\reddit-scout\scripts\pipeline.js \
  --niche "[pillar topic]" \
  --out "/home/ubuntu/.openclaw/workspace\reddit-scout" \
  --topN 10 --subLimit 8 --gapMs 1200 \
  --time week --kinds top,hot,rising \
  --searchAuto 1 --printChat 1
```

This will:
- Discover relevant subreddits automatically
- Score posts by viral potential (velocity + discussion + ratio)
- Extract top posts with full context (selftext + top comments)
- Generate pattern analysis and viral content ideas

**Key subreddits for tech/AI/career content:**
- r/MachineLearning, r/cscareerquestions, r/datascience
- r/entrepreneur, r/learnmachinelearning, r/artificial

**Fallback (if reddit-scout unavailable):** Use `web_search` queries:
- `site:reddit.com/r/MachineLearning [pillar topic] 2026`
- `site:reddit.com/r/cscareerquestions [pillar topic]`

Look for: posts with 100+ upvotes, threads with debate, pain points people vent about.

### 2. Google News / Web
- `[pillar topic] AI 2026`
- `[pillar topic] machine learning career`
- `[pillar topic] LinkedIn`

Look for: recent articles (past 2 weeks), industry reports, things blowing up.

### 3. Web Search for Viral Angles
- `[pillar topic] controversial opinion`
- `[pillar topic] unpopular take`
- `[pillar topic] myth debunked`

Look for: angles that get engagement, hot takes getting shared.

## Output Format: Research Report

```
## RESEARCH REPORT — [Pillar Topic]
Date: [today]

### 1. What People Are Talking About
[3-5 bullet points: top pain points, questions, debates happening right now]

### 2. Trending Angles / Hot Takes
[3-4 angles that are generating engagement — include source if notable]

### 3. Hook Styles Working Right Now
[2-3 hook patterns getting traction in this space — e.g. "contrarian", "confession", "data-backed claim"]

### 4. Content Gaps (Nobody Is Filling These)
[2-3 angles that are underserved — what's missing from the conversation]

### 5. Ayush's Natural Angle
[1-2 sentences: where does Ayush's story/experience/opinion intersect with what's trending?]
```

After producing the report, immediately pass it to the idea-generator or wait for pillar-workflow to hand off.
