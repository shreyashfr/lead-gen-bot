---
name: pillar-workflow
model: anthropic/claude-sonnet-4-6
description: Pillar Workflow — orchestrates research and idea generation via state machine
---

# 🚨 EXECUTE EXACTLY THIS SEQUENCE. NO DEVIATIONS.

**This is not pseudocode. This is the exact execution order. Do not improvise, reorder, or skip steps.**

---

## STEP 1: INITIALIZE STATE
```
Tool: exec
Command: node {SKILL_BASE}/state.js init {USER_WORKSPACE} "[PILLAR_TOPIC]"
Wait: Yes
```

Output creates `{USER_WORKSPACE}pillar-state.json` with `state: "PILLAR_RECEIVED"`

---

## STEP 2: CHECK & SEND MESSAGE (STATE 1 ONLY)
```
Tool: exec
Command: node {SKILL_BASE}/state.js check {USER_WORKSPACE} "[PILLAR_TOPIC]" | jq -r '.message'
Wait: Yes
```

If output is not empty:
```
Tool: message
Channel: telegram
Target: g-agent-ce-telegram-direct-{USER_TELEGRAM_ID}
Message: [output from above]
```

Then:
```
Tool: exec
Command: node {SKILL_BASE}/state.js mark-sent {USER_WORKSPACE} "[PILLAR_TOPIC]" "PILLAR_RECEIVED"
Wait: Yes
```

Then:
```
Tool: exec
Command: node {SKILL_BASE}/state.js set-state {USER_WORKSPACE} "[PILLAR_TOPIC]" "RESEARCH_RUNNING"
Wait: Yes
```

**Do NOT continue until all 3 tools complete.**

---

## STEP 3: RUN RESEARCH (SILENT — NO MESSAGES)
```
Tool: exec
Command: bash {SKILL_BASE}/run_research.sh --query "[PILLAR_TOPIC]" --out "{USER_WORKSPACE}"
Wait: Yes
Timeout: 900 seconds (15 minutes)
```

**Do NOT send any message while this runs. Do NOT check status. Just wait.**

---

## STEP 4: VALIDATE RESEARCH REPORT EXISTS
```
Tool: exec
Command: [ -f "{USER_WORKSPACE}research-report.md" ] && echo "exists" || echo "missing"
Wait: Yes
```

If output is "missing":
```
Tool: exec
Command: node {SKILL_BASE}/state.js set-error {USER_WORKSPACE} "[PILLAR_TOPIC]" "research_report_missing"
Wait: Yes
```

Then go to STEP 6 (Error Handling). STOP.

If output is "exists": continue to STEP 5.

---

## STEP 5: UPDATE STATE & SEND MESSAGE (STATE 2)
```
Tool: exec
Command: node {SKILL_BASE}/state.js set-state {USER_WORKSPACE} "[PILLAR_TOPIC]" "RESEARCH_DONE"
Wait: Yes
```

Then:
```
Tool: exec
Command: node {SKILL_BASE}/state.js check {USER_WORKSPACE} "[PILLAR_TOPIC]" | jq -r '.message'
Wait: Yes
```

If output is not empty:
```
Tool: message
Channel: telegram
Target: g-agent-ce-telegram-direct-{USER_TELEGRAM_ID}
Message: [output from above]
```

Then:
```
Tool: exec
Command: node {SKILL_BASE}/state.js mark-sent {USER_WORKSPACE} "[PILLAR_TOPIC]" "RESEARCH_DONE"
Wait: Yes
```

Then:
```
Tool: exec
Command: node {SKILL_BASE}/state.js set-state {USER_WORKSPACE} "[PILLAR_TOPIC]" "IDEA_GENERATION"
Wait: Yes
```

---

## STEP 6: SPAWN IDEA-GENERATOR (SILENT)

Do NOT send any message before or after spawning.

```
Tool: sessions_spawn
Runtime: subagent
AgentId: idea-generator
Task: 
"Read {USER_WORKSPACE}research-report.md and {USER_WORKSPACE}master-doc.md. 

Generate 15 ideas ONLY. Do NOT explain, narrate, or add anything.

EXACT FORMAT FOR EACH IDEA (no variations, copy exactly):

📌 Idea #[N] — \"[idea title]\"
Format: [LP|TH|XA|TW|CA]
Hook: \"[specific hook text]\"
Rationale: [one sentence explaining why this works]
📎 Source: [full URL from research report]

[blank line between ideas]

LEGEND:
LP = LinkedIn Post
TH = Twitter Thread
XA = X Article
TW = Tweet
CA = Instagram Carousel

EXAMPLE FORMAT:
📌 Idea #1 — \"RAG is dead\" (clickbait unpack)
Format: TH
Hook: \"Saw a YouTube video: 'RAG is dead.' But is it really? Let me unpack what's actually happening with retrieval-augmented generation in 2026.\"
Rationale: Hook on trending narrative. Thoughtful rebuttal. Engages contrarian thinkers.
📎 Source: https://www.youtube.com/watch?v=f3zHina9MTo

📌 Idea #2 — [next idea...]
...

[AFTER ALL 15 IDEAS, INCLUDE EXACTLY THIS, NO VARIATION:]

━━━━━━━━━━

📅 What's your production plan?

Tell me:

1. Which ideas you want to produce (pick numbers, e.g. 2, 5, 9)
2. How many of each format you want this week:

e.g.

• 5x LinkedIn Posts
• 4x Twitter Threads
• 3x Tweets
• 3x Instagram Carousels

I'll start producing one at a time and send for your review before moving to the next.

[THAT IS ALL. NO OTHER TEXT.]

Post this complete report directly to Telegram:
- Channel: telegram
- Target: g-agent-ce-telegram-direct-{USER_TELEGRAM_ID}
- Message: [full ideas report with production plan]

Do NOT send any other messages. Do NOT narrate. Do NOT explain. Just post the report. Then STOP."

Mode: run
Timeout: 120
```

**Do NOT wait for completion. Spawn and continue.**

---

## STEP 7: DONE

You are finished. The idea-generator subagent:
- Reads research report
- Generates 15 ideas
- Posts directly to user's Telegram
- User reviews and requests production plan

You do NOT:
- Check if ideas were posted
- Send completion messages
- Do anything else

**workflow complete.**

---

## ERROR HANDLING (STEP 6 if research fails)

If state is ERROR:
```
Tool: exec
Command: node {SKILL_BASE}/state.js check {USER_WORKSPACE} "[PILLAR_TOPIC]" | jq -r '.message'
Wait: Yes
```

If output is not empty:
```
Tool: message
Channel: telegram
Target: g-agent-ce-telegram-direct-{USER_TELEGRAM_ID}
Message: [output from above]
```

Then:
```
Tool: exec
Command: node {SKILL_BASE}/state.js mark-sent {USER_WORKSPACE} "[PILLAR_TOPIC]" "ERROR"
Wait: Yes
```

**STOP. Do not continue.**

---

## DO NOT DEVIATE FROM THIS SEQUENCE

If you think about deviating:
- ❌ Adding narration
- ❌ Checking status
- ❌ Explaining steps
- ❌ Reordering steps
- ❌ Skipping steps
- ❌ Sending extra messages

**STOP. DO NOT DO IT.**

Follow the sequence exactly. Nothing more, nothing less.
