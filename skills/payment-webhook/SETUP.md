# Stripe Webhook Setup Guide

No Zapier. Stripe talks directly to this server.

---

## How It Works

```
User /start → Bot sends Stripe link (?client_reference_id=TELEGRAM_ID)
     ↓
User pays on Stripe
     ↓
Stripe → POST /stripe-webhook on this server
     ↓
Server verifies Stripe signature → extracts name + email + telegram_id
     ↓
Sends Telegram welcome message + master-doc template to user
     ↓
User fills template → sends back → normal onboarding continues
```

---

## Step 1 — Stripe Payment Link

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Payment Links**
2. Create a link for your Content Engine product
3. Under **Checkout options**, enable **Collect customer name** (required so we get their name)
4. Copy the link URL (e.g. `https://buy.stripe.com/abc123`)

Update `config.json`:
```json
{
  "stripe_payment_link": "https://buy.stripe.com/abc123"
}
```

---

## Step 2 — Open Port 3001

In AWS Console → EC2 → Security Groups → your instance:

Add inbound rule:
- Type: Custom TCP
- Port range: **3001**
- Source: **0.0.0.0/0**

---

## Step 3 — Start the Server

SSH into the server:

```bash
export STRIPE_WEBHOOK_SECRET=whsec_xxx   # from Step 4 below — set this after registering the endpoint
node /home/ubuntu/.openclaw/workspace-ce/skills/payment-webhook/server.js
```

Or use the start script (runs in background):
```bash
export STRIPE_WEBHOOK_SECRET=whsec_xxx
/home/ubuntu/.openclaw/workspace-ce/skills/payment-webhook/start.sh
```

Verify it's running:
```bash
curl http://56.228.5.164:3001/health
# → {"status":"ok","service":"content-engine-stripe-webhook"}
```

---

## Step 4 — Register Stripe Webhook

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `http://56.228.5.164:3001/stripe-webhook`
3. Events to send: **`checkout.session.completed`** (that's the only one needed)
4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_`)
6. Set it as `STRIPE_WEBHOOK_SECRET` when starting the server (restart server if already running)

---

## Step 5 — Test It

Use Stripe's **Test mode** + test card `4242 4242 4242 4242`:

1. Build the test URL manually:
   `https://buy.stripe.com/YOUR_LINK?client_reference_id=YOUR_TELEGRAM_ID`
2. Complete checkout with your name + email
3. You should receive the welcome message + template on Telegram within seconds

Or test the webhook directly:
```bash
curl -X POST http://localhost:3001/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: skip" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "client_reference_id": "YOUR_TELEGRAM_ID",
        "customer_details": {
          "name": "Test User",
          "email": "test@example.com"
        },
        "payment_status": "paid"
      }
    }
  }'
```
> Note: signature check skips if `STRIPE_WEBHOOK_SECRET` is not set — useful for local testing.

---

## Auto-start on Reboot

```bash
crontab -e
# Add:
@reboot STRIPE_WEBHOOK_SECRET=whsec_xxx PORT=3001 node /home/ubuntu/.openclaw/workspace-ce/skills/payment-webhook/server.js >> /home/ubuntu/.openclaw/workspace-ce/skills/payment-webhook/webhook.log 2>&1
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Port not reachable | Check AWS security group has port 3001 open |
| Signature invalid | Make sure `STRIPE_WEBHOOK_SECRET` matches the one in Stripe Dashboard |
| No name in webhook | Enable "Collect customer name" in your Stripe Payment Link settings |
| Template not sent | Check `skills/onboarding/master-doc-template.md` exists |
| Check logs | `tail -f skills/payment-webhook/webhook.log` |
