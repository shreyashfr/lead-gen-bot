#!/bin/bash
# run_research.sh — runs all 4 scouts and outputs a clean combined research report
# Usage: bash run_research.sh --query "AI and IoT" --out "/path/to/user/workspace" --niche "software engineers India"

QUERY=""
OUT_DIR=""
NICHE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --query) QUERY="$2"; shift 2 ;;
    --out)   OUT_DIR="$2"; shift 2 ;;
    --niche) NICHE="$2"; shift 2 ;;
    *) shift ;;
  esac
done

if [ -z "$QUERY" ] || [ -z "$OUT_DIR" ]; then
  echo "Usage: bash run_research.sh --query 'topic' --out '/user/workspace' --niche 'niche'"
  exit 1
fi

SKILLS_DIR="/home/ubuntu/.openclaw/workspace-ce/skills"
WORKSPACE_SKILLS="/home/ubuntu/.openclaw/workspace/skills"

echo "🔍 Running research for: $QUERY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Run all 4 scouts in parallel, all output to files
node "$SKILLS_DIR/reddit-scout/scripts/pipeline.js" \
  --niche "$QUERY $NICHE" \
  --out "$OUT_DIR/reddit-scout" \
  --topN 10 --subLimit 8 --gapMs 1200 \
  --time week --kinds top,hot,rising \
  --searchAuto 1 > /tmp/reddit-scout.log 2>&1 &
REDDIT_PID=$!

node "$SKILLS_DIR/twitter-scout/scripts/pipeline.js" \
  --query "$QUERY 2026" \
  --out "$OUT_DIR/twitter-scout" \
  --topN 10 > /tmp/twitter-scout.log 2>&1 &
TWITTER_PID=$!

node "$SKILLS_DIR/google-news-scout/scripts/pipeline.js" \
  --query "$QUERY $NICHE" \
  --out "$OUT_DIR/google-news-scout" \
  --topN 10 --daysBack 7 > /tmp/google-news-scout.log 2>&1 &
GNEWS_PID=$!

node "$WORKSPACE_SKILLS/youtube-scout/scripts/pipeline.js" \
  --query "$QUERY $NICHE" \
  --out "$OUT_DIR/youtube-scout" \
  --topN 8 --searchN 20 > /tmp/youtube-scout.log 2>&1
YOUTUBE_EXIT=$?

wait $REDDIT_PID $TWITTER_PID $GNEWS_PID

echo ""
echo "✅ All 4 scouts complete."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Output combined report ────────────────────────────────────────────────────

echo "## COMBINED RESEARCH REPORT — $QUERY"
echo "Date: $(date -u +%Y-%m-%d)"
echo ""

# Reddit
REDDIT_REPORT=$(find "$OUT_DIR/reddit-scout" -name "report.md" 2>/dev/null | sort | tail -1)
if [ -n "$REDDIT_REPORT" ]; then
  echo "### REDDIT"
  cat "$REDDIT_REPORT"
  echo ""
else
  echo "### REDDIT: no results"
  echo ""
fi

# Twitter
TWITTER_REPORT=$(find "$OUT_DIR/twitter-scout" -name "report.md" 2>/dev/null | sort | tail -1)
if [ -n "$TWITTER_REPORT" ]; then
  echo "### TWITTER/X"
  cat "$TWITTER_REPORT"
  echo ""
else
  echo "### TWITTER/X: no results"
  echo ""
fi

# YouTube
YOUTUBE_REPORT=$(find "$OUT_DIR/youtube-scout" -name "report.md" 2>/dev/null | sort | tail -1)
if [ -n "$YOUTUBE_REPORT" ]; then
  echo "### YOUTUBE"
  cat "$YOUTUBE_REPORT"
  echo ""
else
  echo "### YOUTUBE: no results"
  echo ""
fi

# Google News
GNEWS_REPORT=$(find "$OUT_DIR/google-news-scout" -name "report.md" 2>/dev/null | sort | tail -1)
if [ -n "$GNEWS_REPORT" ]; then
  echo "### GOOGLE NEWS"
  cat "$GNEWS_REPORT"
  echo ""
else
  echo "### GOOGLE NEWS: no results"
  cat /tmp/google-news-scout.log | tail -20
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "END OF RESEARCH REPORT"
