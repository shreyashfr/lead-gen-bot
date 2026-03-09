---
name: dispatcher
description: >
  Multi-user router for the Content Engine. Fires on EVERY inbound Telegram message.
  Identifies the user by their Telegram sender_id, loads their isolated workspace,
  checks onboarding status, and routes to the correct skill. This is the entry point
  for all user interactions with the Content Engine.
---

# Content Engine Dispatcher

Every message from Telegram goes through here first. No exceptions.

---

## STEP 0 — IDENTIFY THE USER

Read the inbound metadata (trusted, from OpenClaw system). Extract:
- `sender_id` → the Telegram user's numeric ID (e.g. `5122439348`)
- `sender_name` → their display name (use as greeting fallback)

> **This is the user's permanent identity.** Never confuse two users. The sender_id is ground truth.

---

## STEP 1 — CHECK THE REGISTRY

Read: `/home/ubuntu/.openclaw/workspace/users/registry.json`

Look up `users[sender_id]`:

**If NOT found → new user. Run ONBOARDING skill.**
Set `USER_WORKSPACE = /home/ubuntu/.openclaw/workspace/users/{sender_id}/`
Create the user's directory immediately.

**If found → returning user.**
Load from registry:
- `USER_WORKSPACE` = their workspace path
- `USER_NAME` = their name
- `onboarding_complete` = true/false
- `onboarding_step` = current step if incomplete

---

## STEP 2 — ROUTE THE MESSAGE

### If `onboarding_complete = false`
→ Run ONBOARDING skill. Pass `USER_WORKSPACE`, `sender_id`, current `onboarding_step`.

### If `onboarding_complete = true`
Route based on message content:

| Message matches | Route to |
|---|---|
| `Pillar: [topic]` | pillar-workflow skill (with user context) |
| `pillar: [topic]` | pillar-workflow skill (with user context) |
| `run competitive scan` | competitive-tracker skill (with user context) |
| `my numbers` / `update performance` | performance-tracker skill (with user context) |
| `reschedule` / `change schedule` | user-scheduler skill |
| `pause schedule` / `stop reminders` | user-scheduler: disable their cron |
| `resume schedule` | user-scheduler: re-enable their cron |
| anything else | handle as general content engine conversation in their context |

---

## STEP 3 — INJECT USER CONTEXT INTO SKILLS

When calling any content engine skill, always prepend this instruction:

```
IMPORTANT: This is a multi-user system. The current user is:
- Name: {USER_NAME}
- Workspace: {USER_WORKSPACE}

For ALL file paths in this skill, replace:
  /home/ubuntu/.openclaw/workspace/master-doc.md
    → {USER_WORKSPACE}master-doc.md
  /home/ubuntu/.openclaw/workspace/voice-memory.json
    → {USER_WORKSPACE}voice-memory.json
  /home/ubuntu/.openclaw/workspace/content-queue.md
    → {USER_WORKSPACE}content-queue.md
  /home/ubuntu/.openclaw/workspace/competitive-gaps.md
    → {USER_WORKSPACE}competitive-gaps.md
  /home/ubuntu/.openclaw/workspace/feed-intelligence.md
    → {USER_WORKSPACE}feed-intelligence.md
  /home/ubuntu/.openclaw/workspace/performance-log.md
    → {USER_WORKSPACE}performance-log.md
  /home/ubuntu/.openclaw/workspace/recycle-queue.md
    → {USER_WORKSPACE}recycle-queue.md
  /home/ubuntu/.openclaw/workspace/competitor-list.md
    → {USER_WORKSPACE}competitor-list.md
  /home/ubuntu/.openclaw/workspace/ (any other file)
    → {USER_WORKSPACE}
  /home/ubuntu/.openclaw/workspace/reddit-scout/
    → {USER_WORKSPACE}reddit-scout/

Also: wherever the skill refers to "Ayush" or "Ayush Singh" — replace with {USER_NAME}.
Their niche and positioning are in {USER_WORKSPACE}master-doc.md.
```

---

## STEP 4 — REPLY ROUTING

All replies go back to the same Telegram sender. OpenClaw handles this automatically since you're replying in the active session.

You do not need to manually route replies — just produce them normally.

---

## PRIVACY RULE

Never mention one user's name, content, or data to another user. Each user only ever sees their own workspace. If you ever find yourself about to reference another user's content — stop and check your context.

---

## REGISTRY FORMAT

When adding a new user or updating, write to registry.json:
```json
{
  "users": {
    "5122439348": {
      "name": "Ayush Singh",
      "workspace": "/home/ubuntu/.openclaw/workspace/users/5122439348/",
      "onboarding_complete": true,
      "onboarding_step": null,
      "schedule": {
        "frequency": "weekly",
        "day": "sunday",
        "time_ist": "10:00",
        "cron_job_id": "job_abc123"
      },
      "joined": "2026-03-09",
      "platforms": ["linkedin", "twitter", "instagram"],
      "niche": "AI/ML careers"
    }
  }
}
```

Always read the full registry, merge your change, and write the full file back. Never overwrite other users.
