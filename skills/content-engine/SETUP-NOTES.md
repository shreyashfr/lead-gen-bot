# Content Engine — Setup Notes

## How User Isolation Works

### Session isolation (OpenClaw level)
`session.dmScope: "per-channel-peer"` is enabled in the gateway config.

This means every Telegram user gets a **completely separate conversation session**.
User A cannot see User B's chat history. This is enforced at the framework level.

### Workspace isolation (file level)
Each user's content data lives in their own directory:
```
users/{telegram_id}/
  master-doc.md       ← their brand bible
  voice-memory.json   ← their tone rules
  content-queue.md    ← their approved content
  onboarding-state.json
```

The dispatcher reads `sender_id` from the trusted inbound metadata (injected by
OpenClaw, not user-controlled) and loads only that user's workspace.

### Shreyash (owner)
- Telegram ID: `5122439348`
- Routes to: personal assistant mode (not content engine)
- His personal data lives in the main workspace root

### {USER_NAME} (existing content engine user)
- Needs his Telegram ID to pre-register him
- His existing master-doc.md and voice-memory.json are in the main workspace root
- **To migrate Ayush:**
  1. Get his Telegram ID (ask him to DM the bot, then check logs: `openclaw logs --follow`)
  2. Create `users/{ayush_id}/` directory
  3. Copy `master-doc.md` → `users/{ayush_id}/master-doc.md`
  4. Copy `voice-memory.json` → `users/{ayush_id}/voice-memory.json`
  5. Create `users/{ayush_id}/content-queue.md` (empty)
  6. Add {USER_NAME} to `users/registry.json` with `onboarding_complete: true`
  7. He can immediately use `Pillar: [topic]` — no re-onboarding needed

  OR: let {USER_NAME} go through the fresh 7-step onboarding (takes 5 min),
  then manually enrich his master-doc with the existing detailed content.

## Telegram Bot Access
- `dmPolicy: "open"` — anyone can message the bot
- `allowFrom: ["*"]` — no allowlist restriction
- Change to `dmPolicy: "allowlist"` when you add authentication later

## Adding New Users
No manual steps needed. When someone messages the bot:
1. OpenClaw creates their isolated session (`per-channel-peer`)
2. Dispatcher detects new `sender_id`, creates `users/{id}/` directory
3. Onboarding starts automatically
4. They're fully set up within 5-10 messages
