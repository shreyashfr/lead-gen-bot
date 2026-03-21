#!/bin/bash
# run_research.sh — runs all 4 scouts, writes combined report to file
# Usage: bash run_research.sh --query "AI and War" --out "/workspace/" --niche "AI tech"

QUERY=""; OUT_DIR=""; NICHE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --query) QUERY="$2"; shift 2 ;;
    --out)   OUT_DIR="$2"; shift 2 ;;
    --niche) NICHE="$2"; shift 2 ;;
    *) shift ;;
  esac
done

SKILLS_DIR="/home/ubuntu/.openclaw/workspace-ce/skills"
WORKSPACE_SKILLS="/home/ubuntu/.openclaw/workspace/skills"
REPORT_FILE="$OUT_DIR/research-report.md"

echo "🔍 Running research: $QUERY"

# Run all 4 scouts in parallel, output to log files only
node "$SKILLS_DIR/reddit-scout/scripts/pipeline.js" \
  --niche "$QUERY $NICHE" \
  --out "$OUT_DIR/reddit-scout" \
  --topN 10 --subLimit 8 --gapMs 1200 \
  --time week --kinds top,hot,rising \
  --searchAuto 1 > /tmp/reddit-scout.log 2>&1 &

node "$SKILLS_DIR/twitter-scout/scripts/pipeline.js" \
  --query "$QUERY 2026" \
  --out "$OUT_DIR/twitter-scout" \
  --topN 10 > /tmp/twitter-scout.log 2>&1 &

node "$SKILLS_DIR/google-news-scout/scripts/pipeline.js" \
  --query "$QUERY $NICHE" \
  --out "$OUT_DIR/google-news-scout" \
  --topN 10 --daysBack 7 > /tmp/google-news-scout.log 2>&1 &

node "$WORKSPACE_SKILLS/youtube-scout/scripts/pipeline.js" \
  --query "$QUERY $NICHE" \
  --out "$OUT_DIR/youtube-scout" \
  --topN 8 --searchN 20 > /tmp/youtube-scout.log 2>&1

wait

# Build combined report from report.md files
{
echo "## RESEARCH REPORT — $QUERY"
echo "Date: $(date -u +%Y-%m-%d)"
echo ""

for platform in reddit-scout twitter-scout youtube-scout google-news-scout; do
  LABEL=$(echo $platform | tr '[:lower:]' '[:upper:]' | sed 's/-SCOUT//' | sed 's/-/ /')
  REPORT=$(find "$OUT_DIR/$platform" -name "report.md" 2>/dev/null | sort | tail -1)
  echo "---"
  echo "### $LABEL"
  if [ -n "$REPORT" ]; then
    cat "$REPORT"
  else
    echo "No results."
  fi
  echo ""
done
} > "$REPORT_FILE"

echo "✅ Research complete. Report saved to: $REPORT_FILE"
echo "Lines: $(wc -l < $REPORT_FILE)"
