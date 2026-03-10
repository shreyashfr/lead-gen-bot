---
name: idea-generator
description: 'Generates 15 content ideas for Ayush Singh based on a research report and master-doc. Use after research-agent produces a report. Each idea includes: hook, angle, format, which story from Ayush''s life fits, and why it will work. Sends the ideas report to Ayush for selection. Ayush picks by replying with numbers (e.g. go with 1, 3, 5).'
---

# Idea Generator

Takes a research report + master-doc and generates 15 content ideas for Ayush.

## Inputs Required
1. Research report from research-agent (current session context)
2. Master doc — always read:
   `/home/ubuntu/.openclaw/workspace/master-doc.md`
   Focus on: **Hook Library**, **Core Opinions & Angles**, **Open Threads**, **What You've Posted**

## Generation Rules

### Idea Quality Bar
Each idea must:
- Have a specific hook (not generic)
- Reference one of Ayush's real stories or real opinions from master-doc
- Have a clear format (LinkedIn post / Twitter thread / carousel / single tweet)
- Have a "why this works" rationale (one sentence)

### Avoid
- Repeating angles already posted (check "What You've Posted" in master-doc)
- Generic AI/ML takes anyone could write
- Ideas that don't connect to the user's actual experience
- Leaving the Reference field blank — every idea must cite the exact Reddit or Twitter URL it was inspired by

### Angle Mix
Aim for variety across the 15 ideas:
- 3-4 personal story angles (from his life)
- 3-4 opinion/hot-take angles (his stances on the industry)
- 2-3 educational angles (frameworks, breakdowns, systems)
- 1-2 wildcard / emotional angles (depression, failure, identity)

## Output Format: Ideas Report

Use EXACTLY this format. Do not invent alternative formats or use emoji icons as field labels.

```
## IDEAS REPORT — [Pillar Topic]

Pick your favorites by replying with number + format.
e.g. "1, LP" or "4, TH"  (LP=LinkedIn Post, TH=Twitter Thread, XA=X Article, TW=Tweet, CA=Carousel)

━━━━━━━━━━

1. [Short idea title]
Hook: "[exact hook line]"
Angle: [one sentence — what's the argument or story]
Story that fits: [which moment from the user's life anchors this]
Why it works: [one sentence]
Reference: [exact URL of the Reddit post or Tweet that inspired this idea — REQUIRED, never leave blank]

━━━━━━━━━━

2. [Short idea title]
Hook: ...
Angle: ...
Story that fits: ...
Why it works: ...
Reference: [URL — REQUIRED]

[repeat through 15]
```

Every single idea MUST have a Reference URL. If the research report has the post URL, use it. If not, use the Reddit permalink format: `https://reddit.com/r/{subreddit}/comments/{post_id}`

## After Ayush Selects
Pass each approved idea to content-producer with:
- The hook
- The angle
- The format
- The story reference

Produce one piece at a time and send for review before producing the next.
