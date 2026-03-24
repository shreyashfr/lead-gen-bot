#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_DIR="/home/ubuntu/.openclaw/workspace"
VIEWER_DIR="$WORKSPACE_DIR/openclaw-viewer"
LOG_FILE="/home/ubuntu/.openclaw/openclaw-viewer.log"

CLAWD_ROOT_OPTIONAL=${CLAWD_ROOT:-"/home/ubuntu/.clawdbot"}
WORKSPACE_OPTIONAL=${WORKSPACE_DATA:-"/home/ubuntu/.clawdbot/workspace"}
GATEWAY_LOG=${GATEWAY_LOG:-"/home/ubuntu/.clawdbot/gateway.log"}

cd "$VIEWER_DIR"
export CLAWD_ROOT="$CLAWD_ROOT_OPTIONAL"
export CLAWD_WORKSPACE=${WORKSPACE_OPTIONAL}
export CLAWD_GATEWAY_LOG=$GATEWAY_LOG

npm run dev > "$LOG_FILE" 2>&1 &
echo "Viewer running (PID $!) logs -> $LOG_FILE"
