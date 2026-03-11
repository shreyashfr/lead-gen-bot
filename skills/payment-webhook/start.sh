#!/bin/bash
# Start the Content Engine payment webhook server
# Run this once — it stays running in background via nohup

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/home/ubuntu/.openclaw/workspace-ce/skills/payment-webhook/webhook.log"
PID_FILE="/home/ubuntu/.openclaw/workspace-ce/skills/payment-webhook/webhook.pid"

# ── Required env vars ─────────────────────────────────────────────────────────
if [ -z "$PAYMENT_WEBHOOK_SECRET" ]; then
  echo "ERROR: Set PAYMENT_WEBHOOK_SECRET before starting."
  echo "  export PAYMENT_WEBHOOK_SECRET=your-secret-token"
  exit 1
fi

if [ -z "$STRIPE_PAYMENT_LINK" ]; then
  echo "WARNING: STRIPE_PAYMENT_LINK not set. Bot will show placeholder in /start messages."
fi

# ── Kill existing instance if running ────────────────────────────────────────
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "Stopping existing webhook server (PID $OLD_PID)..."
    kill "$OLD_PID"
    sleep 1
  fi
  rm -f "$PID_FILE"
fi

# ── Start server ──────────────────────────────────────────────────────────────
echo "Starting Content Engine payment webhook on port ${PORT:-3001}..."

nohup node "$SCRIPT_DIR/server.js" >> "$LOG_FILE" 2>&1 &
NEW_PID=$!
echo $NEW_PID > "$PID_FILE"

sleep 1
if kill -0 "$NEW_PID" 2>/dev/null; then
  echo "✅ Webhook server started (PID $NEW_PID)"
  echo "   Log: $LOG_FILE"
  echo "   Health: curl http://localhost:${PORT:-3001}/health"
else
  echo "❌ Server failed to start. Check log: $LOG_FILE"
  exit 1
fi
