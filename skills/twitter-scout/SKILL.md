---
name: twitter-scout
description: >
  Playwright-based Twitter/X viral tweet research pipeline.
  Uses saved session cookies (session.json) + Decodo ISP proxy — no login required per run.
  Searches for viral tweets on a given query/topic and returns a structured report.
  Use in research-agent alongside reddit-scout for dual-platform research.
---

# Twitter Scout

Scrapes viral tweets for a given query using Playwright + stealth + saved session.

## Prerequisites
- `session.json` must exist at: `/home/ubuntu/.openclaw/workspace/skills/twitter-scout/session.json`
- Uses Decodo ISP proxy (already configured in pipeline.js)
- playwright-extra + puppeteer-extra-plugin-stealth installed

## Command

```bash
node /home/ubuntu/.openclaw/workspace/skills/twitter-scout/scripts/pipeline.js \
  --query "[topic]" \
  --out "/home/ubuntu/.openclaw/workspace/twitter-scout" \
  --topN 10 \
  --printChat
```

## Parameters
- `--query` — search query (use the pillar topic + relevant keywords)
- `--out` — output directory (use workspace twitter-scout folder)
- `--topN` — number of top tweets to return (default 10)
- `--printChat` — print progress logs

## Output
Writes to: `{out}/{slug}/runs/{runId}/`
- `report.md` — human-readable ranked tweet report
- `top_posts_detailed.json` — full tweet data
- `posts_ranked.json` — all tweets sorted by viral score

Also prints to stdout: top 5 tweets with metrics and URL for coordinator use.

## Viral Score
Computed from: likes + retweets×2 + quotes×2 + replies + bookmarks (capped at 10)

## Session Refresh
If session expires (redirects to /login), new cookies needed:
- Login to x.com manually in browser
- Export cookies to session.json in Playwright storageState format
- Path: `/home/ubuntu/.openclaw/workspace/skills/twitter-scout/session.json`
