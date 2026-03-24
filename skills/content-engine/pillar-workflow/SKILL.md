---
name: pillar-workflow
model: anthropic/claude-sonnet-4-6
description: >
  Pillar Workflow: Orchestrates research and idea generation for content pillars.
  Trigger on 'Pillar: [topic]' command. Uses state.js for all messaging.
---

# 🚨 ORCHESTRATOR ONLY — NO IDEA GENERATION, NO NARRATION

**Pillar-workflow ONLY:**
- Initialize state
- Send 2 hard-coded messages (via state.js)
- Spawn idea-generator subagent
- Track state
- STOP

**Pillar-workflow NEVER:**
- Generates ideas
- Reads research reports
- Formats or explains anything
- Sends arbitrary messages
- Says "let me", "great", "I already sent"
- Recaps, narrates, or explains

---

## State File: `{USER_WORKSPACE}pillar-state.json`

```json
{
  "pillar": "[TOPIC]",
  "state": "PILLAR_RECEIVED",
  "message_sent": {
    "pillar_received": false,
    "research_done": false,
    "error": false
  }
}
```

---

## WORKFLOW

### Step 0: Initialize State
```bash
node {SKILL_BASE}/state.js init {USER_WORKSPACE} "[TOPIC]"
```

### Step 1: Check & Send Message (STATE 1)
```bash
MSG=$(node {SKILL_BASE}/state.js check {USER_WORKSPACE} "[TOPIC]")

if [ "$(echo $MSG | jq -r '.shouldSend')" = "true" ]; then
  message(action=send, channel=telegram, target={USER_TELEGRAM_ID}, message="$(echo $MSG | jq -r '.message')")
  node {SKILL_BASE}/state.js mark-sent {USER_WORKSPACE} "[TOPIC]" "PILLAR_RECEIVED"
  node {SKILL_BASE}/state.js set-state {USER_WORKSPACE} "[TOPIC]" "RESEARCH_RUNNING"
fi
```

**Hard-coded Message 1:**
```
🔍 Searching viral posts around "[TOPIC]" on Reddit, Twitter/X, YouTube and Google News...

Retrieving top ideas and hooks. This takes 8-12 minutes — sit back and relax. 🙌
```

### Step 2: Run Research (SILENT)
```bash
bash run_research.sh --query "[TOPIC]" --out {USER_WORKSPACE}
```

No messages. No updates. Just run.

### Step 3: Check Research Done
```bash
if [ -f {USER_WORKSPACE}research-report.md ]; then
  node {SKILL_BASE}/state.js set-state {USER_WORKSPACE} "[TOPIC]" "RESEARCH_DONE"
else
  node {SKILL_BASE}/state.js set-error {USER_WORKSPACE} "[TOPIC]" "no report"
fi
```

### Step 4: Check & Send Message (STATE 3)
```bash
MSG=$(node {SKILL_BASE}/state.js check {USER_WORKSPACE} "[TOPIC]")

if [ "$(echo $MSG | jq -r '.shouldSend')" = "true" ]; then
  message(action=send, channel=telegram, target={USER_TELEGRAM_ID}, message="$(echo $MSG | jq -r '.message')")
  node {SKILL_BASE}/state.js mark-sent {USER_WORKSPACE} "[TOPIC]" "RESEARCH_DONE"
  node {SKILL_BASE}/state.js set-state {USER_WORKSPACE} "[TOPIC]" "IDEA_GENERATION"
fi
```

**Hard-coded Message 2:**
```
✅ Research done!

💡 Generating 15 ideas now — matching what's trending against your voice, stories, and opinions. Give me a minute...
```

### Step 5: Spawn Idea-Generator (SILENT)
```bash
sessions_spawn(
  runtime: "subagent",
  agentId: "idea-generator",
  task: "Read {USER_WORKSPACE}research-report.md and {USER_WORKSPACE}master-doc.md. Generate 15 ideas. Each idea must have: hook, angle, format (LinkedIn Post/Twitter Thread/X Article/Tweet/Instagram Carousel), story reference, why it works, source URL. Format exactly as:

[N]. [Title]
Hook: \"[hook text]\"
Angle: [one sentence]
Format: [format]
Story: [story reference]
Why: [one sentence]
📎 Source: [full URL from research report]

After all 15 ideas, include ONLY this production plan block (no variation):

━━━━━━━━━━

📅 What's your production plan?

Tell me:
1. Which ideas you want (e.g. 2, 5, 9)
2. How many of each format:

e.g.
5x LinkedIn Posts
4x Twitter Threads
3x Tweets
3x Instagram Carousels

I'll start producing one at a time and send for your review before moving to the next.

Post directly to Telegram using message(channel='telegram', target='g-agent-ce-telegram-direct-{USER_TELEGRAM_ID}', message=[complete report]). Do NOT send any other messages. Do NOT narrate. Do NOT explain. Just the report. Then STOP.",
  mode: "run",
  timeoutSeconds: 120
)
```

### Step 6: Error Handling
```bash
MSG=$(node {SKILL_BASE}/state.js check {USER_WORKSPACE} "[TOPIC]")

if [ "$(echo $MSG | jq -r '.shouldSend')" = "true" ]; then
  message(action=send, channel=telegram, target={USER_TELEGRAM_ID}, message="⚠️ Hit a hiccup. Try again in a moment.")
  node {SKILL_BASE}/state.js mark-sent {USER_WORKSPACE} "[TOPIC]" "ERROR"
fi
```

---

## That's It

No other steps. No idea generation. No narration. No recaps.

If you find yourself writing anything other than the workflow above → **STOP. Delete it.**

The idea-generator subagent is 100% responsible for generating and posting the ideas report with the correct format.

Pillar-workflow orchestrates only.
