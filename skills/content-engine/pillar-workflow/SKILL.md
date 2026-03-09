---
name: pillar-workflow
description: >
  Pillar Workflow: Generates and orchestrates content creation based on users' input pillars.
  Trigger this skill whenever the user explicitly inputs a 'pillar: [topic]' or 'Pillar: [topic]' command.
  Works for any Content Engine user — uses dispatcher-injected USER_NAME, USER_WORKSPACE, USER_NICHE.
---

# PILLAR WORKFLOW

Orchestrates the full content pipeline: Research → Ideas → Selection → Production → Approval → Airtable.

---

## MULTI-USER CONTEXT

This skill is user-agnostic. The dispatcher injects:
- `{USER_NAME}` — current user's name
- `{USER_WORKSPACE}` — `/home/ubuntu/.openclaw/workspace/users/{telegram_id}/`
- `{USER_NICHE}` — from registry or master-doc

Replace ALL file paths:
- `/home/ubuntu/.openclaw/workspace/` → `{USER_WORKSPACE}`
- Any hardcoded "Ayush" or "Ayush Singh" → `{USER_NAME}`

---

## STEP 0 — ANNOUNCE BEFORE EVERY LONG TASK

Before starting any processing step, always send a heads-up message to the user. Never silently start a long task.

**Before Research (Step 1):**

Use the `message` tool to send this FIRST (before any exec/tool calls):
```
🔍 Starting research on: [Pillar Topic]

Scanning Reddit + Twitter/X for what's viral around this right now — top posts, hot takes, pain points, content gaps.

This usually takes 5-7 minutes. I'll send the full report + 15 ideas when it's ready. Hang tight...
```

Only AFTER this message is sent → run the Reddit Scout exec call.
Do NOT combine the announcement and the tool call in the same turn.

**Before Idea Generation (Step 2):**
```
💡 Research done. Generating 15 ideas now...

Matching your voice, story, and experience against what's trending. Takes about 1-2 minutes.
```

**Before Content Production (Step 4):**
```
✍️ Writing [Format] for idea #[n]...

Drafting in your voice. Takes about 1 minute.
```

Always send the announcement FIRST, then run the task.

---

## STEP 1 — RESEARCH (run both scouts)

Run reddit-scout AND twitter-scout in sequence for the pillar topic.

**Reddit Scout:**
```bash
node /home/ubuntu/.openclaw/workspace/skills/reddit-scout/scripts/pipeline.js \
  --niche "[pillar topic] {USER_NICHE}" \
  --out "/home/ubuntu/.openclaw/workspace/reddit-scout" \
  --topN 10 --subLimit 8 --gapMs 1200 \
  --time week --kinds top,hot,rising \
  --searchAuto 1 --printChat 1
```

**Twitter Scout:**
```bash
node /home/ubuntu/.openclaw/workspace/skills/twitter-scout/scripts/pipeline.js \
  --query "[pillar topic] 2026" \
  --out "/home/ubuntu/.openclaw/workspace/twitter-scout" \
  --topN 10 \
  --printChat
```

If Twitter session expired: continue with Reddit only, note the gap.

After both run, feed output to **research-agent** to compile the Research Report.

---

## STEP 2 — IDEA GENERATION

Pass the Research Report + `{USER_WORKSPACE}master-doc.md` to **idea-generator**.

Generate 15 ideas. Each must:
- Have a specific hook
- Reference a real story/opinion from the user's master-doc
- Specify format (LP / TH / XA / TW / CA)
- Have a "why this works" rationale
- Include source URL from Reddit or Twitter data

Send the IDEAS REPORT to the user.

---

## STEP 3 — USER SELECTION

Wait for the user to reply with idea numbers + formats.
e.g. "1, LP" or "3, TH, 7, TW"

---

## STEP 4 — CONTENT PRODUCTION

For each selected idea, pass to **content-producer**:
- Hook
- Angle
- Format
- Story reference
- User's voice-memory: `{USER_WORKSPACE}voice-memory.json`
- User's master-doc: `{USER_WORKSPACE}master-doc.md`

Produce ONE piece at a time. Send to user before moving to the next.

---

## STEP 5 — APPROVAL LOOP

User reviews each piece.

**On APPROVE:**
- Update content-queue: `{USER_WORKSPACE}content-queue.md`
- If Airtable enabled: push to Airtable (read config from `{USER_WORKSPACE}airtable-config.json`)
- Move to next piece

**On REJECT / REQUEST CHANGES:**
- Run **reflection-agent** to generate Composite reflection (Explanation + Solution + Instructions)
- Apply reflection to rewrite
- Re-send for approval
- Log to `{USER_WORKSPACE}voice-memory.json` → feedback_log

---

## STEP 6 — AIRTABLE PUSH

Read `{USER_WORKSPACE}airtable-config.json`.
If `enabled: true`, push each approved piece via Airtable REST API:

```
POST https://api.airtable.com/v0/{base_id}/{table_name}
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "fields": {
    "Content": "[post text]",
    "Format": "[LP/TH/XA/TW/CA]",
    "Pillar": "[pillar topic]",
    "Status": "Ready to Schedule",
    "Date Created": "[today]"
  }
}
```

Push one record at a time. Confirm each push to the user.

---

## SESSION QUALITY STANDARDS

- Never produce generic AI-sounding content
- Always check voice-memory guardrails before sending any draft
- Run voice-guardian validation before presenting to user
- Remember feedback across the session — don't repeat rejected patterns
