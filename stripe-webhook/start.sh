#!/bin/bash
cd /home/ubuntu/.openclaw/workspace/stripe-webhook
pkill -f "node server.js" 2>/dev/null || true
sleep 1
nohup node server.js >> /home/ubuntu/.openclaw/workspace/stripe-webhook/webhook.log 2>&1 &
echo $! > webhook.pid
echo "✅ Stripe webhook server started (PID: $(cat webhook.pid))"
