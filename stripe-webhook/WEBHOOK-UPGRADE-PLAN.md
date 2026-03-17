# Webhook Upgrade Plan — True Code-Level Payment Enforcement

## Current Setup (Agent-level, 3 layers)
- Registry is code-controlled (only webhook server writes payment_confirmed: true)
- SOUL.md + AGENTS.md + dispatcher all check payment before doing anything
- Prompt injection protections in place

## Why Dual Polling Doesn't Work
Two processes with the same bot token calling getUpdates = Telegram splits messages
between them unpredictably. Not viable.

## True Code-Level Enforcement (when you're ready)
Switch from OpenClaw polling → Telegram webhook to our server.

### Steps:
1. Get SSL cert (free via Let's Encrypt):
   ```
   sudo certbot certonly --standalone -d yourdomain.com
   ```

2. Add HTTPS to our server (port 443 or 8443)

3. Register webhook with Telegram:
   ```
   curl "https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://yourdomain.com/telegram"
   ```

4. Our server receives ALL messages first:
   - Unpaid → reply with payment link, DROP message (OpenClaw never sees it)
   - Paid → forward to OpenClaw internal API

5. Disable OpenClaw's Telegram polling in config

### Result
Zero way for unpaid users to reach the AI. Enforced at TCP level, not prompt level.

## Right Now
Current 3-layer agent enforcement is solid for a 5-10 user bot.
Upgrade to webhooks when you scale or need zero-trust enforcement.
