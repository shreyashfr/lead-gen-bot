# Content Engine — Multi-User Routing

This file governs how the Content Engine handles messages from multiple Telegram users.

---

## When to Activate

Activate multi-user routing when a message arrives via Telegram (channel = telegram).

Check inbound metadata for `sender_id`. If present and it's not Shreyash's personal ID (`5122439348`), this is a Content Engine user — not Shreyash himself.

**Shreyash's Telegram ID:** `5122439348`
- Messages from Shreyash go to normal assistant flow (personal assistant, not content engine)

**All other Telegram sender IDs** → Content Engine multi-user flow → load dispatcher skill

---

## Dispatcher Entry Point

Load: `skills/content-engine/dispatcher/SKILL.md`

The dispatcher handles everything from there:
- Registry lookup
- New user → onboarding
- Existing user → route to correct skill
- Path injection for all content skills

---

## User Workspaces

All user data lives in: `/home/ubuntu/.openclaw/workspace/users/`

**Never** read or write one user's files when processing another user's message.

Registry: `/home/ubuntu/.openclaw/workspace/users/registry.json`

---

## Schedule Reminder Handling

When a cron fires with a system event containing `CONTENT_SCHEDULE_REMINDER`:
1. Parse `user_id`, `user_name`, `workspace` from the event
2. Send the reminder message to that user's Telegram ID using `message` tool
3. Do not process as a regular user message — just deliver the reminder

---

## Privacy

- Never expose one user's niche, content, or ideas to another
- Each user only sees their own data
- If you ever cross-contaminate — stop, correct, apologize

---

## Scaling Notes

Currently: single Telegram bot, all users on one channel.
The `message` tool with `target={telegram_user_id}` routes to the correct person.

Future: if load grows, consider spawning per-user sub-sessions with their own workspace context.
