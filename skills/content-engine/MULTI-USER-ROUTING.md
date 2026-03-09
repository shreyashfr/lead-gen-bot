# Content Engine — Multi-User Routing

Simple routing for 5-10 users on the Telegram bot.

---

## How It Works

1. Every Telegram message arrives at the main session
2. Check `sender_id` from trusted inbound metadata
3. If Shreyash (`5122439348`) → normal assistant, skip content engine
4. Anyone else → load `dispatcher/SKILL.md`

The dispatcher:
- Reads `users/registry.json`
- New user → runs `onboarding/SKILL.md`
- Mid-onboarding → resumes onboarding from their saved step
- Setup complete → routes `Pillar: [topic]` to pillar-workflow with their workspace injected

---

## User Workspaces

Each user's data lives at: `users/{telegram_id}/`

```
users/
  registry.json
  812345678/
    master-doc.md
    voice-memory.json
    content-queue.md
    onboarding-state.json
```

All content engine skills use the user's workspace path instead of the global workspace.
The dispatcher injects this substitution before running any skill.

---

## Privacy

Each user only ever sees and interacts with their own workspace.
Never reference one user's data when processing another user's message.
