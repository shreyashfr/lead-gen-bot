# Zapier + Stripe + Telegram Setup Guide

Complete this guide once. After setup, the entire payment → onboarding flow runs automatically.

---

## Overview

```
User /start → Bot sends Stripe link (with their Telegram ID)
     ↓
User pays on Stripe
     ↓
Stripe → Zapier (checkout.session.completed)
     ↓
Zapier → POST /payment on this server
     ↓
Server → Sends Telegram welcome + master-doc template to user
     ↓
User fills template → sends back → normal onboarding continues
```

---

## PART 1 — Stripe Setup

### 1a. Create a Payment Link

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Payment Links**
2. Create a new link for your Content Engine subscription product
3. Copy the link URL (looks like `https://buy.stripe.com/xxx`)

### 1b. Enable `client_reference_id` Support

Stripe payment links support a `client_reference_id` URL parameter out of the box.

When a user clicks their personalised link:
`https://buy.stripe.com/xxx?client_reference_id=TELEGRAM_ID`

Stripe stores this ID in the `checkout.session.completed` event automatically. No extra setup needed.

### 1c. Update config.json

Edit: `skills/payment-webhook/config.json`

```json
{
  "stripe_payment_link": "https://buy.stripe.com/YOUR_ACTUAL_LINK"
}
```

---

## PART 2 — Start the Webhook Server

### 2a. Open port 3001 in AWS Security Group

1. AWS Console → EC2 → Security Groups → your instance's group
2. Add inbound rule:
   - Type: Custom TCP
   - Port: 3001
   - Source: 0.0.0.0/0 (or restrict to Zapier IPs if you want tighter security)

### 2b. Start the server

SSH into your server and run:

```bash
export PAYMENT_WEBHOOK_SECRET=your-secret-here   # pick any strong secret
export STRIPE_PAYMENT_LINK=https://buy.stripe.com/xxx

cd /home/ubuntu/.openclaw/workspace-ce/skills/payment-webhook
./start.sh
```

### 2c. Auto-start on reboot (optional but recommended)

Add to `/etc/rc.local` or create a systemd service:

```bash
# Simple crontab approach:
crontab -e
# Add this line:
@reboot PAYMENT_WEBHOOK_SECRET=your-secret STRIPE_PAYMENT_LINK=https://buy.stripe.com/xxx node /home/ubuntu/.openclaw/workspace-ce/skills/payment-webhook/server.js >> /tmp/payment-webhook.log 2>&1
```

### 2d. Verify it's running

```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","service":"content-engine-payment-webhook"}

# From outside (replace with your server IP):
curl http://56.228.5.164:3001/health
```

---

## PART 3 — Zapier Setup

### Zap: Stripe Payment → Notify Content Engine

**Step 1 — Trigger: Stripe**

- App: **Stripe**
- Event: **New Payment** (or **Checkout Session Completed** — preferred)
- Connect your Stripe account
- Test the trigger with a real or test payment

**Step 2 — Filter (optional but recommended)**

Add a filter: only continue if `Payment Status = paid` (or `Session Status = complete`)

**Step 3 — Action: Webhooks by Zapier**

- App: **Webhooks by Zapier**
- Event: **POST**
- URL: `http://56.228.5.164:3001/payment`
- Payload Type: `JSON`
- Data:
  ```
  secret        → your-secret-here    (same as PAYMENT_WEBHOOK_SECRET above)
  telegram_id   → {{client_reference_id}}
  name          → {{customer_details_name}}  (or {{billing_details_name}})
  email         → {{customer_details_email}}
  ```
- Headers: `Content-Type: application/json`

**Step 4 — Test the Zap**

Use Stripe test mode. Make a test payment with `client_reference_id` set to your own Telegram ID.

You should receive the Telegram welcome message + template file within seconds.

---

## PART 4 — Stripe Test Mode Flow

To test end-to-end before going live:

1. Set Stripe to **Test Mode**
2. Manually POST to your webhook with test data:
   ```bash
   curl -X POST http://localhost:3001/payment \
     -H "Content-Type: application/json" \
     -d '{
       "secret": "your-secret-here",
       "telegram_id": "YOUR_TELEGRAM_ID",
       "name": "Test User",
       "email": "test@example.com"
     }'
   ```
3. Check your Telegram — you should get the welcome message + template

---

## Troubleshooting

**Webhook not receiving Zapier POST?**
- Check port 3001 is open: `curl http://56.228.5.164:3001/health`
- Check server logs: `tail -f /home/ubuntu/.openclaw/workspace-ce/skills/payment-webhook/webhook.log`

**Bot token error?**
- Make sure OpenClaw is configured with a valid Telegram bot token
- Check `/home/ubuntu/.openclaw/openclaw.json` has the real token (not `__OPENCLAW_REDACTED__`)

**User not getting the template file?**
- Check `skills/onboarding/master-doc-template.md` exists in the CE workspace
- Server reads from: `/home/ubuntu/.openclaw/workspace-ce/skills/onboarding/master-doc-template.md`

**Wrong name/email from Stripe?**
- In Zapier, try both `customer_details_name` and `billing_details_name` — which one has data depends on your Stripe checkout settings
- Enable "Collect name" in your Stripe Payment Link settings to ensure name is always available
