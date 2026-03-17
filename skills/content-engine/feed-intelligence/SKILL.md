---
name: feed-intelligence
description: 'Searches 30+ posts per platform in {USER_NAME}''s niche (AI, ML, careers, founders) on X, LinkedIn, and Instagram. Not feed scrolling - active niche search. Updates feed-intelligence.md and master-doc.md with trending hooks, viral formats, content gaps. Run daily or before any pillar session.'
---

# Feed Intelligence

Active niche search across X, LinkedIn, Instagram. Not scrolling {USER_NAME}'s personal feed — searching the niche directly for what's working right now.

## When to Run
- Daily (ideally morning before {USER_NAME} starts work)
- Always before generating ideas for a new pillar
- After being triggered: "run feed intelligence" or "update feed intel"

## Output File
`/home/ubuntu/.openclaw/workspace/feed-intelligence.md`
Append each run with date header. Don't overwrite — this file compounds over time.

---

## NICHE KEYWORDS TO SEARCH

### Primary (always search these)
- "machine learning engineer" OR "ML engineer"
- "AI jobs" OR "AI careers"
- "data science dead" OR "data science 2025" OR "data science 2026"
- "LLM production" OR "AI in production"
- "traditional ML" OR "classic ML"
- "AI startup" OR "founder AI"
- "SaaS layoffs" OR "tech layoffs 2026"
- "AI replacing" OR "AI replacing jobs"

### Secondary (rotate based on current pillar)
Store current pillar focus in search if pillar context is available.

---

## STEP-BY-STEP EXECUTION

### PLATFORM 1 — X (Twitter)

Use `web_search` with these queries, each focused on X content:
```
site:x.com [keyword] min_faves:100
```
Or search via Brave Search for recent X posts.

Also use `web_fetch` on these X search URLs:
```
https://x.com/search?q=[keyword]&f=top&src=typed_query
```

Target: **30 posts minimum** across all keyword searches combined.

For each post capture:
- Author + handle
- Full text (or first 100 chars)
- Engagement (likes, reposts if visible)
- Format (thread, single tweet, article)
- Why it's working (gut read)

---

### PLATFORM 2 — LinkedIn

Search via web:
```
site:linkedin.com/posts [keyword]
```
Or use Brave Search: `linkedin [keyword] [current year]`

Target: **30 posts minimum** combined.

For each post capture:
- Author + title
- Hook (first line)
- Engagement signals (reactions count if visible)
- Format (long post, list, personal story)

---

### PLATFORM 3 — Instagram

Search via web:
```
site:instagram.com [keyword] carousel OR reel
```
Or use Brave Search: `instagram [keyword] reel 2025 OR 2026`

If browser is available, search Instagram directly:
- Open instagram.com
- Use search to look up: #machinelearning #aicareer #techjobs #mlengineering #founderlife
- Look at top posts (not recent) — top = proven engagement

Target: **30 posts minimum** (Reels + Carousels) combined.

For each capture:
- Account name
- Caption hook (first line)
- Likes / comments
- Format (carousel or reel)
- Content type (tutorial, story, list, take)

---

## ANALYSIS — What to Extract

After collecting posts, analyze and extract:

### 1. Trending Hooks (exact lines working right now)
List the actual opening lines that got high engagement. These are ready to adapt.

### 2. Viral Formats
What formats are dominating? Single tweets, carousels, long threads, X articles?

### 3. Content Gaps
What is NOT being talked about that fits {USER_NAME}'s niche and expertise?
Gaps = opportunities. Look for:
- Angles everyone's avoiding (too controversial? too technical?)
- Topics that are slightly past trend but not overdone
- {USER_NAME}'s unique angles that nobody else can cover (SBL founder story, ZenML era, etc.)

### 4. Engagement Patterns
What gets bookmarks vs likes vs comments? (These are different signals)
- Comments = controversial or relatable
- Bookmarks = useful or actionable
- Likes only = entertaining but forgettable

### 5. Competitor Activity
Note what accounts similar to {USER_NAME} are posting (not copying — flagging for gap analysis)

---

## OUTPUT FORMAT

Write to `feed-intelligence.md`:

```markdown
## Feed Intelligence — [YYYY-MM-DD]

### X (Twitter)
**Top performing hooks seen:**
- "[exact line]" — @handle — X likes — [why it works]
- ...

**Viral formats this week:**
- [format]: [description of what's working]

**Content gaps on X:**
- [gap description]

---

### LinkedIn
**Top performing hooks seen:**
- "[exact line]" — [name] — [signals] — [why it works]

**Formats working:**
- [format]: [description]

**Content gaps on LinkedIn:**
- [gap]

---

### Instagram
**Top performing content:**
- [account] — [caption hook] — [engagement] — [format]

**Carousel patterns working:**
- [pattern description]

**Content gaps on Instagram:**
- [gap]

---

### Cross-Platform Patterns
**Universal hooks right now:**
- [pattern]

**Narrative macro this week:**
- [big narrative/debate dominating the space]

**Ready-to-use angles for {USER_NAME}:**
- [specific angle that maps to {USER_NAME}'s story/expertise]
- [another angle]
- [another angle]
```

---

## MASTER-DOC UPDATE

After writing feed-intelligence.md, also update the FEED INTELLIGENCE section in master-doc.md with today's entry (using the same format as the existing dated entries in that section).

Keep the master-doc section tight — only add things that are genuinely useful for content creation, not raw data dumps.

---

## BROWSER vs WEB_SEARCH

Prefer `web_search` (Brave API) for speed — it doesn't require browser automation.
Use browser only if:
- Searching Instagram directly (web search misses recent content)
- Need to see actual post engagement numbers
- web_search isn't returning fresh results

If using browser: use the `openclaw` profile (already logged in after first session).
Navigate to platform → use search → read top posts → close. Don't scroll the feed.
