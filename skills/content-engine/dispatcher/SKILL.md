---
name: dispatcher
description: >
  Entry point for every Telegram message from a Content Engine user.
  Identifies the user by sender_id, loads their workspace, routes to
  onboarding (if new) or content engine (if set up).
---

# Content Engine Dispatcher

Runs on every inbound Telegram message that is NOT from Shreyash (ID: 5122439348).

---

## STEP 1 — IDENTIFY THE USER

From the trusted inbound metadata, extract:
- `sender_id` — Telegram numeric user ID (e.g. `812345678`)
- `sender_name` — their display name (fallback greeting only)

---

## STEP 2 — CHECK THE REGISTRY

Read: `/home/ubuntu/.openclaw/workspace/users/registry.json`

Look up `users[sender_id]`:

**Not found → new user.**
Create their workspace directory: `/home/ubuntu/.openclaw/workspace/users/{sender_id}/`
Run the **onboarding** skill.

**Found, `onboarding_complete: false` → onboarding in progress.**
Read `onboarding_step` from registry.
Run the **onboarding** skill, resuming from their current step.

**Found, `onboarding_complete: true` → set up. Route their message.**

---

## STEP 3 — ROUTE MESSAGES (setup complete users)

| Message | Route to |
|---|---|
| `Pillar: [topic]` or `pillar: [topic]` | pillar-workflow skill |
| `run competitive scan` | competitive-tracker skill |
| `my numbers` / `update performance` | performance-tracker skill |
| anything else | answer as content engine assistant in their context |

**When running any content engine skill for a user, always inject:**

```
MULTI-USER CONTEXT:
- User name: {USER_NAME}
- User workspace: {USER_WORKSPACE}

Replace ALL file paths in the skill:
  /home/ubuntu/.openclaw/workspace/  →  {USER_WORKSPACE}
  Any mention of "Ayush" or "Ayush Singh"  →  {USER_NAME}

Their niche, voice, and positioning are in {USER_WORKSPACE}master-doc.md
```

---

## PRIVACY

Never reference one user's data when handling another user's message.
Each user only ever sees and interacts with their own workspace.

---

## REGISTRY FORMAT

```json
{
  "users": {
    "812345678": {
      "name": "Rahul Sharma",
      "workspace": "/home/ubuntu/.openclaw/workspace/users/812345678/",
      "onboarding_complete": true,
      "onboarding_step": null,
      "platforms": ["linkedin", "twitter"],
      "niche": "SaaS growth",
      "joined": "2026-03-09"
    }
  }
}
```

Always read the full registry, update only the relevant user, write the full file back.
