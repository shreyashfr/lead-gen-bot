---
name: reddit-scout
description: Scout Reddit niches via Reddit JSON endpoints (old.reddit.com + reddit.com *.json), compute a viral score, fetch top posts, and generate reusable idea reports + Reddit-style card images (no interactive browser automation). Use for trend/idea research and recurring niche scans.
---

# Reddit Scout (JSON → score → ideas → cards)

## What this skill does

1) Expand keywords from a niche/pillar
2) Discover subreddits via `https://old.reddit.com/subreddits/search.json?q=...` (or use `--subAllowlist`)
3) Fetch posts from each subreddit (top day/week/month + hot + rising)
4) Optionally fetch global Reddit search results via `https://www.reddit.com/search.json?q=...`
5) Compute a **viral score** (velocity + discussion + ratio)
6) Select Top N posts and fetch full post JSON (`<permalink>.json`) to capture selftext + top comments
7) Render **Reddit-style insight cards** as PNG (includes media previews when possible)
8) Produce a deterministic `report.md` + `chat.md`: ranked posts + pattern extraction + **viral content ideas derived from the fetched posts**

## Workspace “memory” (persistent outputs)

For each run, write under:

`workspace/reddit-scout/<niche-slug>/runs/<timestamp>/`

Files:
- `run_meta.json` — niche, keywords, config
- `subreddits.json` — discovered + filtered + deduped subreddits
- `posts_ranked.json` — scored candidates (top 200)
- `top_posts_detailed.json` — top N with `.json` post + top 3 comments
- `cards/index.json` — mapping post → rendered PNG path
- `cards/<post_id>.png` — rendered card images
- `report.md` — human-readable summary + ideas

Also maintain:
- `workspace/reddit-scout/<niche-slug>/seen.json` — IDs/permalinks already used (to reduce repeats)

## Commands / usage patterns

### Natural-language triggers (auto)
Use this skill when the user asks things like:
- “viral ideas for **<niche>**”
- “give me viral content ideas for **<niche>**”
- “reddit scout **<niche>**”
- “find viral posts around **<niche>**”
- “generate viral ideas + posts around **<niche>**”
- “reddit scout: top posts this week for **<niche>**”

### Run a scout (CLI-backed)
User:
- “Reddit scout for **<niche>**”
- “Find viral posts for **<niche>**, top 10”
- “Viral ideas for **<niche>** this week” (map to `--time week`)

Agent flow:
1) Immediately post a progress message:
   "I’m performing deep research on viral posts for <niche> on Reddit. It may take 5–7 minutes. Please sit back and relax."
2) While running, periodically summarize progress (subreddits scanned, candidates scored, topN selected, cards rendered).
3) Run pipeline script:

```powershell
node /home/ubuntu/.openclaw/workspace/skills/reddit-scout/scripts/pipeline.js \
  --niche "Large Language Models and AI" \
  --out "/home/ubuntu/.openclaw/workspace/reddit-scout" \
  --topN 15 --subLimit 10 --gapMs 1200 \
  --time all --kinds top,hot,rising \
  --searchAuto 1 --printChat 1 --sendCardsN 5
```

Global Reddit search (improves recall of viral posts):
- By default: `--searchAuto 1` uses the **niche meaning** as the query.
- Override: `--search "fertility clinic"` (query terms are joined with `+` for the URL)
- Disable: `--searchAuto 0`
- `--searchSort top|relevance|new|comments` (default: top)
- `--searchTime day|week|month|year|all` (default: aligns with `--time`, else all)

Example:
```powershell
node ...pipeline.js --niche "fertility" --search "fertility clinic" --time week --kinds top,rising
```

Time filters:
- `--time day` → `/top.json?t=day`
- `--time week` → `/top.json?t=week`
- `--time month` → `/top.json?t=month`
- `--time all` (default) → day+week+month

Subreddit controls:
- `--subAllowlist "memes,dankmemes,me_irl"` (force specific subs)
- `--minSubscribers 200000` (avoid tiny subs)

Global search:
- `--search "<query>"` to pull in viral posts outside discovered subs

4) Create `report.md` + `chat.md` from the outputs:
- include “top terms/patterns” + “viral content ideas”
- include permalinks + card references
- write `send_cards.json` containing absolute PNG paths + captions for messaging-channel attachment sending (default top 5; control with `--sendCardsN`).

### Relevance controls
- By default, posts are filtered by `mustInclude` keywords derived from the niche tokens (>=4 chars).
- You can override with:
  - `--mustInclude "pizza,pizzeria"`

(Planned: explicit `--subAllowlist` / `--subExclude` flags.)

### Debug
- open `posts_ranked.json` and inspect why items were chosen.

## Notes / constraints
- Always set a real User-Agent.
- Respect rate limits: use `--gapMs` and small caps (`--subLimit`, `--limitPerListing`).
- Reddit JSON endpoints can change; treat failures as expected and continue.

## Implementation files
- `scripts/pipeline.js` — end-to-end fetch + score + select + detail fetch + render
- `scripts/render_cards.js` — SVG → PNG renderer (uses `sharp`)
- `scripts/reddit_http.js` — polite fetch with headers, timeouts, retries, gaps
- `scripts/score.js` — viral score function

Cards now include **downloaded media previews** when available:
- images (`post_hint=image`)
- gallery first image (`is_gallery` + `media_metadata`)
- rich video thumbnails (YouTube oEmbed thumbnail)

Known limitations:
- some galleries/videos may not expose stable thumbnails; best-effort only.
