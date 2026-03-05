# Standardized Content Engine Process

**Version:** 1.0  
**Last Updated:** 2026-03-04

---

## 📁 File Structure for Each Run

```
content-engine/runs/<pillar-slug>/<timestamp>/
├── run_meta.json                 # Run metadata + status
├── research_report.md            # Compiled research (all sources)
├── ideas_report.md               # 25 viral ideas (structured)
├── production_plan.md            # Format assignments
├── drafts/                       # All drafts
│   ├── linkedin-01-draft.md
│   ├── linkedin-02-draft.md
│   └── ...
├── approved/                     # Approved content
│   ├── linkedin-01-approved.md
│   └── ...
├── reflections/                  # Rejection reflections
│   └── linkedin-02-reflection.json
└── airtable_records.json         # Airtable record IDs
```

---

## 🔍 Research Phase: Multi-Source Standard

### Sources (in order of priority):

1. **Reddit (via reddit-scout)** - PRIMARY
   - Viral posts, comment analysis, pattern extraction
   - Output: `reddit-scout/<niche>/runs/<timestamp>/`

2. **X/Twitter Trends** - SECONDARY
   - Trending topics, viral tweets, sentiment analysis
   - Tools: Twitter API (if available) or web scraping
   - Output: `x_trends.json`

3. **Google News** - TERTIARY
   - Recent articles, media coverage, industry reports
   - Tools: Brave Search API or Google News RSS
   - Output: `google_news.json`

4. **LinkedIn Scanning** - SUPPLEMENTARY
   - Top posts in niche, competitor analysis
   - Tools: web_fetch on key profiles
   - Output: `linkedin_intel.json`

5. **HackerNews/Industry** - SUPPLEMENTARY
   - Tech community sentiment, contrarian takes
   - Output: `hn_industry.json`

---

## 💡 Ideas Report: Standardized Format (25 Ideas)

### Structure:

```markdown
# 💡 VIRAL IDEAS REPORT — [Pillar Topic]
**Generated:** YYYY-MM-DD HH:MM  
**Sources:** Reddit (10 posts) | X Trends (5 topics) | Google News (8 articles)  
**Total Ideas:** 25

---

## Idea 01: [Title]
**Source:** 🔴 Reddit (r/cscareerquestions, 3.5K upvotes)  
**Hook:** [Exact opening line]  
**Angle:** [One-line description of the tension/take]  
**Format Fit:** LinkedIn (primary), Thread (secondary), X Article  
**Story Anchor:** [Which personal story/experience connects]  
**Viral Score:** 9/10  
**Why It Works:** [Insight from research - emotional archetype, gap filled, etc.]

---

## Idea 02: [Title]
**Source:** 🐦 X Trends (#AIJobs trending, 47K tweets/24h)  
**Hook:** [Exact opening line]  
**Angle:** [One-line description]  
**Format Fit:** Tweet (primary), Thread (secondary)  
**Story Anchor:** [Connection point]  
**Viral Score:** 8/10  
**Why It Works:** [Reasoning]

---

## Idea 03: [Title]
**Source:** 📰 Google News (NYT article, 2026-03-01)  
**Hook:** [Exact opening line]  
**Angle:** [One-line description]  
**Format Fit:** X Article (primary), LinkedIn (secondary)  
**Story Anchor:** [Connection]  
**Viral Score:** 7.5/10  
**Why It Works:** [Reasoning]

---

[... continue for all 25 ideas ...]

---

## 📊 Source Breakdown
- 🔴 Reddit: 12 ideas (viral posts, comment patterns, gap analysis)
- 🐦 X/Twitter: 6 ideas (trending topics, viral tweets)
- 📰 Google News: 4 ideas (recent coverage, data reports)
- 💼 LinkedIn: 2 ideas (competitor gaps, high-performing posts)
- 🌐 Other: 1 idea (HN, industry blogs)

---

## 🎯 Top 5 Recommended (by viral score)
1. Idea 05 (9.5/10) - [Title] - Source: Reddit
2. Idea 12 (9/10) - [Title] - Source: X Trends
3. Idea 01 (9/10) - [Title] - Source: Reddit
4. Idea 18 (8.5/10) - [Title] - Source: Google News
5. Idea 07 (8.5/10) - [Title] - Source: Reddit

---

**Next Step:** Pick 5-8 ideas and I'll assign formats to hit 22-piece target.
```

---

## 📋 Production Plan: Format Assignment

After user picks ideas, present:

```markdown
# 📋 PRODUCTION PLAN — [Pillar]
**Selected Ideas:** 1, 5, 7, 12, 18  
**Target:** 22 pieces

---

## Format Distribution

### LinkedIn Posts (5)
- Idea 01 → LinkedIn long-form (power dynamics angle)
- Idea 05 → LinkedIn case study (personal story)
- Idea 07 → LinkedIn counter-narrative (data-backed)
- Idea 12 → LinkedIn tactical (framework)
- Idea 18 → LinkedIn thought leadership (trend analysis)

### X Articles (3)
- Idea 05 → 2000+ words (deep dive on personal automation)
- Idea 07 → 2000+ words (data analysis + research)
- Idea 18 → 2000+ words (trend commentary + predictions)

### Twitter Threads (3)
- Idea 01 → 10-tweet thread (numbered, power structure breakdown)
- Idea 12 → 8-tweet thread (framework walkthrough)
- Idea 07 → 7-tweet thread (data highlights + sources)

### Single Tweets (7)
- Idea 01 → Hook version (power question)
- Idea 05 → Quote version (personal moment)
- Idea 07 → Stat version (surprising number)
- Idea 12 → Framework teaser (numbered list)
- Idea 18 → Hot take version (contrarian)
- Idea 01 → CTA version (question to audience)
- Idea 05 → Resource version (link + one-liner)

### Instagram Carousels (4)
- Idea 12 → Framework slides (step-by-step visual)
- Idea 01 → Power dynamics slides (comparison format)
- Idea 07 → Data storytelling slides (stats + insights)
- Idea 18 → Trend breakdown slides (timeline format)

---

**Total:** 5 LinkedIn + 3 Articles + 3 Threads + 7 Tweets + 4 Carousels = 22 ✅

**Production Order:**
1. LinkedIn posts (1-5)
2. Threads (6-8)
3. Articles (9-11)
4. Tweets (12-18)
5. Carousels (19-22)

**Starting now. Piece 1 in 2 minutes.**
```

---

## ✍️ Draft Presentation: Standard Format

```markdown
## ✍️ [FORMAT] #[N] — [Title]
**Piece [N] of 22**  
**Idea:** #[X] from ideas report  
**Source:** [Reddit/X/Google News]

---

[full content here]

---

**Voice Guardian Check:** ✅ Passed all 4 layers  
**Airtable:** Ready to push on approval  
**Content Queue:** Will log after approval

---

**Reply:**
- **"approved"** → Push to Airtable, move to next
- **"fix: [issue]"** → Revise and resubmit
```

---

## 📊 Progress Updates: Standard Format

After every 5 pieces:

```markdown
## 📊 PROGRESS UPDATE
**Completed:** 5 / 22 pieces  
**Approved:** 4 pieces  
**Pending revisions:** 1 piece  
**Airtable:** 4 records pushed ✅  
**Time elapsed:** 45 minutes  
**Est. time remaining:** ~60 minutes

**Next up:** Thread #1 (Idea 01)
```

---

## 🔄 After Run Completion

### Files Updated:
1. ✅ `content-engine/runs/<pillar>/<timestamp>/` - Full run archive
2. ✅ `content-engine/content-queue.md` - Append all approved pieces
3. ✅ `content-engine/research-log.md` - Append research insights
4. ✅ `content-engine/performance-log.md` - Placeholder for future tracking
5. ✅ Airtable - All records pushed with IDs logged

### Run Summary:

```markdown
# ✅ RUN COMPLETE — [Pillar Topic]
**Date:** YYYY-MM-DD  
**Duration:** X hours Y minutes  
**Pieces produced:** 22 / 22 ✅

## Research Sources
- 🔴 Reddit: 10 viral posts analyzed (viral score range: 0-648)
- 🐦 X Trends: 5 trending topics tracked
- 📰 Google News: 8 recent articles reviewed
- 💼 LinkedIn: 3 competitor accounts scanned

## Ideas Generated
- **Total:** 25 ideas
- **Used:** 8 ideas → 22 pieces
- **Top scorer:** Idea 05 (9.5/10 viral score)

## Production Stats
- LinkedIn: 5 pieces ✅
- X Articles: 3 pieces ✅
- Threads: 3 pieces ✅
- Tweets: 7 pieces ✅
- Carousels: 4 pieces ✅

## Voice Guardian
- **Pass rate:** 95% (21/22 passed first check)
- **Rejections:** 1 (tone issue, fixed in revision)
- **AI detection:** All passed ≤0.25 threshold

## Airtable
- **Records pushed:** 22
- **Base:** https://airtable.com/apprDKHi7GVzcXuN3
- **Record IDs:** Logged in `airtable_records.json`

## Files
- **Run archive:** `content-engine/runs/[pillar]/[timestamp]/`
- **Content queue:** Updated ✅
- **Research log:** Updated ✅

---

**Next pillar ready to run anytime.**
```

---

## 🎯 Key Standards Summary

### Research Phase:
- ✅ Multi-source (Reddit primary, X/News/LinkedIn secondary)
- ✅ 25 ideas minimum (not 15)
- ✅ Source attribution on every idea
- ✅ Viral score + reasoning for each

### Production Phase:
- ✅ One piece at a time (no dumping)
- ✅ Voice Guardian validation before showing
- ✅ Standard approval format
- ✅ Airtable push after approval
- ✅ Content queue logging

### Storage:
- ✅ `content-engine/runs/<pillar>/<timestamp>/` structure
- ✅ Mirrors reddit-scout pattern
- ✅ All artifacts preserved (research, ideas, drafts, reflections)

### Chat Format:
- ✅ Emoji indicators (🔴 Reddit, 🐦 X, 📰 News, 💼 LinkedIn)
- ✅ Structured markdown tables where appropriate
- ✅ Progress tracking every 5 pieces
- ✅ Clear next-step prompts

---

**This document becomes the reference for all future runs.**
