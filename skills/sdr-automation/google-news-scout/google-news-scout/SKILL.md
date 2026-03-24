---
name: google-news-scout
description: >
  Google News RSS-based article research pipeline.
  Fetches Google News RSS for any query, ranks by recency, extracts article titles,
  sources, and URLs. Zero API key needed. Use in research-agent alongside
  reddit-scout, twitter-scout, and youtube-scout for quad-platform research.
---

# Google News Scout

Fetches trending news articles from Google News for a given topic. Scored by recency.

## Prerequisites
- No API key needed
- No auth required
- Uses Google News public RSS feed

## Command

```bash
node /home/ubuntu/.openclaw/workspace-ce/skills/google-news-scout/scripts/pipeline.js \
  --query "[topic + keywords]" \
  --out "{USER_WORKSPACE}google-news-scout" \
  --topN 10 \
  --daysBack 7 \
  --printChat
```

## Parameters
- `--query` — search query (pillar topic + relevant keywords)
- `--out` — output directory
- `--topN` — number of top articles to return (default 10)
- `--daysBack` — filter out articles older than N days (default 7)
- `--printChat` — print progress logs to stdout

## Output
Writes to: `{out}/{slug}/runs/{runId}/`
- `report.md` — ranked articles with titles, sources, URLs
- `chat.md` — condensed coordinator-friendly summary
- `articles.json` — full article data

Also prints to stdout: top articles with sources and URLs for coordinator use.

## Recency Score
- Last 6 hours: 10/10
- Last 24 hours: 9/10
- Last 48 hours: 8/10
- Last week: 5-7/10

## Notes
- RSS feed: `https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en`
- Article URLs go through Google's redirect (they work when clicked)
- Returns articles in English from US edition by default
