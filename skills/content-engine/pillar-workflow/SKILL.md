---
name: pillar-workflow
description: 'Orchestrates Ayush Singh''s full weekly content pipeline. Triggers when message starts with "Pillar: [topic]". Produces 22 pieces per week: 3 X articles, 3 threads, 7 tweets, 5 LinkedIn posts, 4 Instagram carousels. Runs research → ideas → selection → systematic production → Airtable. This is the top-level skill that coordinates all content skills.'
---

# Pillar Workflow — Weekly Content Pipeline

One trigger. 22 pieces. Full automation.

## Trigger
Message matching: `Pillar: [topic]` (case-insensitive, any capitalisation)

---

## CHAT FORMAT LAYER — How to Communicate During the Workflow

> These are the exact message formats to use at each stage. Use dynamic values — never hardcode examples. Keep timestamps current using session_status for the real time.

### Timestamp Format
Every update message uses: `[M/D/YYYY H:MM AM/PM]` (e.g., `[3/5/2026 4:10 PM]`)
Get current time from session_status at the start of each run.

---

### On Trigger — Announce the Pillar
```
🎯 NEW PILLAR: [Topic Title-Cased]

Starting research phase...
Reddit-scout running... (5-7 min)
```

---

### Research Phase — Live Updates (send one message per update)
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
Use real subreddit names discovered during the run. Vary the phrasing slightly each run — do not copy-paste identical lines.

---

### Ideas Output — After Research
```
[timestamp] 💡 [N] VIRAL IDEAS — [Pillar Topic]

Source: 🔴 Reddit ([X] viral posts analyzed)


Idea [01]: [Title]

Source: 🔴 Reddit (r/[subreddit], [upvotes] upvotes)
Hook: "[exact hook line]"
Viral Score: [X]/10

Idea [02]: [Title]
...
[repeat for all ideas, zero-padded numbering: 01, 02 ... 15]


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

### Content Output — Each Piece
```
✍️ [Format Name] — [Idea Title]

Idea: #[n] | Source: 🔴 Reddit | Piece: [x] of 22


[full content here]


Voice Guardian: ✅ Passed all 4 layers
Airtable: Ready to push on approval

Reply:

• "approved" → Push to Airtable, ask for next
• "fix: [what to change]" → Revise and resubmit
```

---

### On Approval — Confirm + Show Progress
```
[timestamp] ✅ Approved! Pushing to Airtable...
[timestamp] ✅ Pushed to Airtable ([Airtable record ID])
✅ Logged to content-queue.md
✅ Saved to approved folder


📊 Progress: [X] / 22 pieces ✅

Completed:

• [Format] #[piece number] (Idea [n])

Next piece?

Pick idea + format (e.g., "1, LP" or "3, XA" or "5, TH")

Top remaining ideas:

• [n], LP - [Idea title] ([score]/10)
• [n], XA - [Idea title] ([score]/10)
• [n], TH - [Idea title] ([score]/10)
• [n], CA - [Idea title] ([score]/10)
• [n], TH - [Idea title] ([score]/10)
```

---

### On Rejection / Fix Request
```
[timestamp] Got it. Running Reflection Agent...
[timestamp] Rewriting [failing section only]...

✍️ [Format Name] — [Idea Title] (Revised)

Idea: #[n] | Source: 🔴 Reddit | Piece: [x] of 22


[revised content]


Voice Guardian: ✅ Passed all 4 layers
Airtable: Ready to push on approval

Reply:

• "approved" → Push to Airtable, ask for next
• "fix: [what to change]" → Revise and resubmit
```

---

## Weekly Deliverables (non-negotiable)
| Format | Count | Notes |
|--------|-------|-------|
| X Articles (long-form) | 3 | Different from threads — single long post |
| Twitter Threads | 3 | Multi-tweet, numbered |
| Tweets | 7 | Single punchy posts |
| LinkedIn Posts | 5 | Long-form, Ayush's voice |
| Instagram Carousels | 4 | Slide copy only, no images |
| **TOTAL** | **22** | |

## Master Files — Read at Start of Every Run
1. `/home/ubuntu/.openclaw/workspace/master-doc.md` — voice, stories, angles, hook library
2. `/home/ubuntu/.openclaw/workspace/content-queue.md` — what's already been produced (avoid repeating)
3. `/home/ubuntu/.openclaw/workspace/feed-intelligence.md` — latest niche trends (if exists)
4. `/home/ubuntu/.openclaw/workspace/competitive-gaps.md` — gaps competitors aren't covering (if exists)

---

## THE FULL FLOW (Single-Agent Intelligence + Voice Guardian)

```
pillar: [topic]
      ↓
STEP 1: COORDINATOR AGENT (single session)
  ├→ Research Deep Dive
  ├→ Trend Psychology
  ├→ Competitive Audit
  ├→ Performance Review
  ├→ Merge → Strategic Brief
  ├→ Generate 15 Ideas
      ↓
STEP 2: IDEAS REPORT → Ayush selects
      ↓
STEP 3: FORMAT ASSIGNMENT (internal)
      ↓
STEP 4: PRODUCTION (one by one)
  ├→ Write draft
  ├→ Voice Guardian validates
  ├→ Send to Ayush (only if approved)
  → 5 LinkedIn posts
  → 3 X Articles (2000+ words)
  → 3 Threads
  → 7 Tweets
  → 4 Carousels
      ↓
STEP 5: REVIEW LOOP (per piece) — Composite Reflection
      ├→ Ayush approves/rejects
      ├→ On rejection: Reflection Agent diagnoses (Explanation+Solution+Instructions)
      ├→ Reflection logged to voice-memory.json (reflection_log + last_rejection_by_format)
      ├→ Content Producer rewrites using Rewrite Brief
      ├→ Voice Guardian revalidates
      ↓
STEP 6: AIRTABLE + QUEUE + BATCH ANALYSIS
  ├→ Push to Airtable
  ├→ Log to content-queue.md
  ├→ End of session: check batch_analysis_state (if ≥5 new reflections → run Tier 2)
  ├→ Tier 2 derives meta-lessons → updates voice_lessons in voice-memory.json
```

---

## STEP 1 — COORDINATOR AGENT (Single-Session Intelligence)

Spawn the Coordinator Agent to run all research, trend, competitive, and performance analysis in ONE session:

```bash
sessions_spawn(
  task="You are the Coordinator Agent. Read /home/ubuntu/.openclaw/workspace/skills/content-engine/coordinator-agent/SKILL.md for full instructions. Your job: (1) run reddit-scout as primary research source, (2) supplement with web research, (3) run trend psychology + competitive audit + performance review, (4) merge into strategic brief, (5) generate 15 viral ideas sorted by viral score. Send live chat updates throughout. Topic: [pillar topic].",
  label="coordinator-[topic]",
  model="anthropic/claude-sonnet-4-6",
  runTimeoutSeconds=600
)
```

The coordinator will (in one session):
1. Research Deep Dive → scans Reddit, Google News, X, LinkedIn, HBR
2. Trend Psychology → extracts emotional patterns + hook archetypes
3. Competitive Audit → analyzes Ayush's past posts + 10 competitor accounts
4. Performance Review → identifies what worked for Ayush historically
5. Strategic Synthesis → merges all 4 into coherent brief
6. Idea Generation → produces 15 ideas

Output: Strategic brief + 15 ideas sent to Ayush for selection.

### Voice Integration

Coordinator reads before starting:
- `master-doc.md` (voice, stories, positioning)
- `voice-memory.json` (forbidden phrases, tone rules, high performers, agent logs)

All analysis is Ayush-flavored, not generic.

---

## STEP 2 — IDEAS REPORT

Run `idea-generator` with:
- Research report
- master-doc.md
- feed-intelligence.md (if exists)
- competitive-gaps.md (if exists)

Generate 15 ideas. Each idea must include:
- Hook (exact opening line)
- Angle (what's the tension, what's the take)
- Format fit (which formats this idea is best for)
- Story from Ayush's life that connects
- Why it will work right now (tie to research)

Send to Ayush in this format:
```
🧠 IDEAS REPORT — [Pillar Topic]

1. [Hook line]
   Angle: [one line]
   Best for: [LinkedIn / Thread / X Article / Carousel]
   Story: [which personal story fits]

2. ...
[repeat for all 15]

Pick your top ideas. Tell me which ones and roughly how many pieces you want from each.
```

---

## STEP 3 — SELECTION + FORMAT ASSIGNMENT

Wait for Ayush's selection. He'll say something like:
- "go with 1, 3, 5, 8, 11"
- "I like 2, 4, 6 — make 2 and 4 big pieces"
- "all of 3, 7, 9 — pick the best formats"

Once selected, internally assign formats to ideas to hit the 22-piece target:

**Assignment logic:**
- Strong personal story → LinkedIn post + X Article + Thread
- Contrarian take with data → LinkedIn post + Thread + 3 Tweets
- How-to / framework → Carousel + LinkedIn post + Thread
- Short punchy take → 2-3 Tweets + X Article
- Trending topic hook → LinkedIn post + Carousel + Tweets

Always ensure the final count is:
✅ 5 LinkedIn posts
✅ 3 X Articles
✅ 3 Threads
✅ 7 Tweets
✅ 4 Carousels

Show Ayush the assignment before producing:
```
📋 PRODUCTION PLAN — [Pillar]

Idea 1 → LinkedIn post + X Article + Thread
Idea 3 → LinkedIn post + Carousel + 2 Tweets
Idea 5 → X Article + Carousel + 3 Tweets
...

Total: 5 LinkedIn / 3 Articles / 3 Threads / 7 Tweets / 4 Carousels ✅

Starting production now. One at a time.
```

---

## STEP 4 — PRODUCTION (with Voice Guardian)

Run `content-producer` for each piece. Voice Guardian validates before Ayush sees it.

**Critical rules:**
- One piece at a time. Never dump multiple drafts at once.
- After Content Producer writes → Voice Guardian validates against voice-memory.json
- Only send to Ayush if Voice Guardian approves
- If Voice Guardian flags issues → Content Producer rewrites only those sections → resubmit to Voice Guardian
- Wait for approval before moving to the next piece
- Label clearly what format this is and which idea it's from

**Production order (suggested):**
Start with LinkedIn posts → then X Articles → then Threads → then Tweets (batch 2-3) → then Carousels

**Voice Guardian Validation:**
Before sending draft to Ayush:
```bash
sessions_spawn(
  task="You are the Voice Guardian. Read /home/ubuntu/.openclaw/workspace/skills/content-engine/voice-guardian/SKILL.md for full instructions. Validate this draft against voice-memory.json. Check: (1) no forbidden phrases, (2) correct tone (conversational not corporate), (3) AI detectability test passes, (4) matches master-doc voice, (5) follows guardrails. Draft: [insert full draft]. Respond APPROVED or list issues with line numbers.",
  label="voice-guardian-[format]-[idea]"
)
```

Only after Voice Guardian approves, send to Ayush:
```
✍️ [FORMAT] — Idea [#]: [Idea Title]
[Piece number] of 22

[content]

---
Reply "approved" or tell me what to fix.
```

---

## STEP 5 — REVIEW LOOP (Composite Reflection)

### On "approved"
→ Log to content-queue.md, push to Airtable, move to next piece.

### On rejection (any feedback other than "approved", or Voice Guardian hard-fail)

Do NOT immediately rewrite. Follow this flow:

```
REJECTION
    ↓
STEP 5A — Spawn Reflection Agent
    ↓
STEP 5B — Content Producer rewrites using the Rewrite Brief
    ↓
STEP 5C — Voice Guardian revalidates
    ↓
STEP 5D — Send revised draft to Ayush
```

**STEP 5A — Spawn Reflection Agent:**
```bash
sessions_spawn(
  task="You are the Reflection Agent. Read /home/ubuntu/.openclaw/workspace/skills/reflection-agent/SKILL.md for full instructions. A draft was rejected. Rejected draft: [insert full draft]. Rejection reason: [insert Ayush feedback OR Voice Guardian issue list]. Format: [format]. Pillar: [topic]. Generate a Composite Reflection (Explanation + Solution + Instructions), log it to voice-memory.json, update last_rejection_by_format, then output the Rewrite Brief.",
  label="reflection-[format]-[date]",
  runTimeoutSeconds=120
)
```

Wait for the Rewrite Brief before proceeding.

**STEP 5B — Content Producer rewrites:**
- Read the Rewrite Brief from Reflection Agent
- Read `voice-memory.json → last_rejection_by_format[format]` for the immediate signal
- Rewrite ONLY the failing sections (not the whole draft unless reflection says otherwise)
- Never rewrite without the Rewrite Brief in hand

**STEP 5C — Voice Guardian revalidates:**
- Same validation as Step 4
- If fails again → loop back to 5A (new reflection based on new failure)
- Maximum 3 loops before flagging to Ayush: "This piece is giving consistent issues — here's what's happening: [summary]"

**STEP 5D — Send to Ayush:**
```
✍️ [FORMAT] — Idea [#]: [Title] (Revised)

[revised content]

---
Reply "approved" or tell me what to fix.
```

### Feedback Log (still maintained)
After every revision, also log to voice-memory.json feedback_log (existing format):
```json
{
  "date": "YYYY-MM-DD",
  "format": "[format]",
  "pillar": "[topic]",
  "idea_number": [n],
  "issue_type": "[hook/tone/depth/structure/format_violation/other]",
  "what_was_wrong": "[specific feedback]",
  "what_fixed_it": "[what changed in the rewrite]"
}
```

- If Ayush is offline mid-session: save progress to `pending-production.md`

---

## STEP 6 — AIRTABLE + QUEUE + BATCH ANALYSIS

### Batch Analysis Check (run once, end of session)

After all 22 pieces are approved OR at natural end of session:

Read `voice-memory.json → batch_analysis_state`:
```
total_reflections_logged - reflections_at_last_analysis
```

- If **≥ 5**: Spawn Reflection Agent in batch analysis mode:
  ```bash
  sessions_spawn(
    task="You are the Reflection Agent in batch analysis mode. Read /home/ubuntu/.openclaw/workspace/skills/reflection-agent/SKILL.md — specifically the 'Tier 2 — Batch Analysis' section. Run the full batch analysis on the reflection_log in voice-memory.json. Derive meta-lessons, update voice_lessons and batch_analysis_state. Output the analysis summary.",
    label="reflection-batch-analysis",
    runTimeoutSeconds=120
  )
  ```
  Wait for summary, then include it at the end of your session wrap-up to Ayush.

- If **< 5**: Skip. Don't burn a session for insufficient data.

Note: The Reflection Agent also auto-checks this count on every individual call — so if you hit 5 mid-session during a burst of rejections, the batch analysis runs inline without waiting for end of session.

### On each approval:

1. Push to Airtable (TOOLS.md has credentials):
```bash
curl -s "https://api.airtable.com/v0/apprDKHi7GVzcXuN3/Posts" \
  -X POST \
  -H "Authorization: Bearer patZ5zuyvWZQ53Q1v.9be8e95f264e0c9de9b902a7e09235f9d289b3ea71c63ef8e318724cbc5f1e27" \
  -H "Content-Type: application/json" \
  -d '{"records":[{"fields":{"Title":"...","Pillar":"[topic]","Platform":"[LinkedIn/X/Instagram]","Hook":"[opening line]","Content":"[full content]","Status":"Draft","Week":"[YYYY-MM-DD Monday of current week]"}}]}'
```
Max 10 records per request — batch if needed.

2. Append to `/home/ubuntu/.openclaw/workspace/content-queue.md`:
```
## [Date] — [Format] — [Idea Title]
**Pillar:** [topic]
**Platform:** [platform]
**Hook:** [opening line]
**Content:** [full text]
**Status:** Draft
**Airtable:** pushed ✅
```

---

## State Files (keep updated throughout)
- `pending-ideas.md` — ideas saved if Ayush doesn't select in same session
- `pending-production.md` — production state if interrupted mid-run
- `content-queue.md` — all approved content
- `research-log.md` — cumulative research, grows each week
- `feed-intelligence.md` — latest niche feed data

---

## Tone During Workflow
No status theater. Keep it tight.
- ❌ "I am now initiating the research phase of the workflow"
- ✅ "Research done. Here are 15 ideas:"
- ❌ "I have successfully completed production of piece 3 of 22"
- ✅ "✍️ LinkedIn Post — Idea 2: [title]"
