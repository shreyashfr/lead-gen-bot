---
name: youtube-scout
description: >
  yt-dlp-based YouTube viral video research pipeline.
  Searches YouTube for a query, scores by view count, fetches transcripts for top videos.
  Returns a structured report with video URLs, titles, views, and transcript excerpts.
  Use in research-agent alongside reddit-scout and twitter-scout for tri-platform research.
---

# YouTube Scout

Searches YouTube for a given topic, ranks by virality (views), and fetches transcripts.

## Prerequisites
- `yt-dlp` installed at: `/home/ubuntu/yt-dlp`
- No API key needed. No login needed.

## Command

```bash
node /home/ubuntu/.openclaw/workspace-ce/skills/youtube-scout/scripts/pipeline.js \
  --query "[topic + keywords]" \
  --out "{USER_WORKSPACE}youtube-scout" \
  --topN 8 \
  --searchN 20 \
  --printChat
```

## Parameters
- `--query` — search query (pillar topic + relevant keywords)
- `--out` — output directory (user's workspace youtube-scout folder)
- `--topN` — number of top videos to return after ranking (default 8)
- `--searchN` — how many videos to fetch before ranking (default 20)
- `--printChat` — print progress logs to stdout

## Output
Writes to: `{out}/{slug}/runs/{runId}/`
- `report.md` — human-readable ranked video report with transcript excerpts
- `chat.md` — condensed coordinator-friendly summary
- `posts_ranked.json` — full video data with transcripts
- `transcripts/{video_id}/` — raw VTT transcript files

Also prints to stdout: top videos with metrics, URL, and transcript excerpt for coordinator use.

## Viral Score
Computed from: log10(view_count), scaled 1-10

## How Transcripts Work
- yt-dlp fetches auto-generated English subtitles (VTT format)
- Falls back to manually uploaded subtitles if auto not available
- Transcripts are stripped of formatting and capped at 8000 chars
- If no transcript available for a video, it's still included in the report (without transcript)

## Notes
- yt-dlp binary path: `/home/ubuntu/yt-dlp`
- If yt-dlp is outdated, update with: `curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /home/ubuntu/yt-dlp && chmod +x /home/ubuntu/yt-dlp`
