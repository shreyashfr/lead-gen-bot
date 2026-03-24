#!/bin/bash
# run_research_fixed.sh — runs all 4 scouts with validation + auto-retry logic
# Usage: bash run_research_fixed.sh --query "AI and War" --out "/workspace/" --niche "AI tech"

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
echo "Workspace: $OUT_DIR"
echo ""

# Helper: count posts in JSON
count_json_array() {
  local file=$1
  if [ -f "$file" ]; then
    jq 'length' "$file" 2>/dev/null || echo 0
  else
    echo 0
  fi
}

# Helper: count entries with URL in JSON
count_with_urls() {
  local file=$1
  if [ -f "$file" ]; then
    jq '[.[] | select(.permalink // .url // .watch?v // empty)] | length' "$file" 2>/dev/null || echo 0
  else
    echo 0
  fi
}

# ==== RUN REDDIT SCOUT (with retry logic) ====
echo "📘 Starting Reddit Scout..."
REDDIT_ATTEMPT=1
REDDIT_POSTS=0

while [ $REDDIT_ATTEMPT -le 3 ] && [ $REDDIT_POSTS -lt 4 ]; do
  if [ $REDDIT_ATTEMPT -eq 1 ]; then
    # First attempt: week, normal parameters
    node "$SKILLS_DIR/reddit-scout/scripts/pipeline.js" \
      --niche "$QUERY" \
      --out "$OUT_DIR/reddit-scout" \
      --topN 20 --subLimit 12 --gapMs 1000 \
      --time week --kinds top,hot,rising \
      --searchAuto 1 > /tmp/reddit-scout.log 2>&1
  elif [ $REDDIT_ATTEMPT -eq 2 ]; then
    # Second attempt: month, broader parameters
    echo "  ⚠️  Retrying Reddit with broader timeframe (month)..."
    node "$SKILLS_DIR/reddit-scout/scripts/pipeline.js" \
      --niche "$QUERY" \
      --out "$OUT_DIR/reddit-scout" \
      --topN 30 --subLimit 15 --gapMs 800 \
      --time month --kinds top,hot,rising \
      --searchAuto 1 > /tmp/reddit-scout.log 2>&1
  else
    # Third attempt: all-time, maximum parameters
    echo "  ⚠️  Retrying Reddit with all-time data..."
    node "$SKILLS_DIR/reddit-scout/scripts/pipeline.js" \
      --niche "$QUERY" \
      --out "$OUT_DIR/reddit-scout" \
      --topN 30 --subLimit 10 --gapMs 800 \
      --time all --kinds top,hot,rising \
      --searchAuto 1 > /tmp/reddit-scout.log 2>&1
  fi

  # Count posts in latest run
  LATEST_REDDIT_RUN=$(find "$OUT_DIR/reddit-scout" -name "top_posts_detailed.json" 2>/dev/null | sort | tail -1)
  REDDIT_POSTS=$(count_with_urls "$LATEST_REDDIT_RUN")
  
  echo "  📊 Reddit Attempt $REDDIT_ATTEMPT: found $REDDIT_POSTS posts with URLs"
  
  if [ $REDDIT_POSTS -ge 4 ]; then
    echo "  ✅ Reddit passed validation ($REDDIT_POSTS posts)"
    break
  fi
  
  REDDIT_ATTEMPT=$((REDDIT_ATTEMPT + 1))
done

# ==== RUN TWITTER SCOUT ====
echo "🐦 Starting Twitter Scout..."
node "$SKILLS_DIR/twitter-scout/scripts/pipeline.js" \
  --query "$QUERY 2026" \
  --out "$OUT_DIR/twitter-scout" \
  --topN 10 > /tmp/twitter-scout.log 2>&1

LATEST_TWITTER_RUN=$(find "$OUT_DIR/twitter-scout" -name "posts_ranked.json" 2>/dev/null | sort | tail -1)
TWITTER_POSTS=$(count_with_urls "$LATEST_TWITTER_RUN")
echo "  📊 Twitter Scout: found $TWITTER_POSTS tweets"

# ==== RUN GOOGLE NEWS SCOUT ====
echo "📰 Starting Google News Scout..."
node "$SKILLS_DIR/google-news-scout/scripts/pipeline.js" \
  --query "$QUERY" \
  --out "$OUT_DIR/google-news-scout" \
  --topN 20 --daysBack 14 > /tmp/google-news-scout.log 2>&1

LATEST_NEWS_RUN=$(find "$OUT_DIR/google-news-scout" -name "articles.json" 2>/dev/null | sort | tail -1)
NEWS_ARTICLES=$(count_with_urls "$LATEST_NEWS_RUN")
echo "  📊 Google News Scout: found $NEWS_ARTICLES articles"

# ==== RUN YOUTUBE SCOUT (with retry logic) ====
echo "🎬 Starting YouTube Scout..."
YOUTUBE_ATTEMPT=1
YOUTUBE_VIDEOS=0

while [ $YOUTUBE_ATTEMPT -le 2 ] && [ $YOUTUBE_VIDEOS -lt 4 ]; do
  if [ $YOUTUBE_ATTEMPT -eq 1 ]; then
    # First attempt: normal parameters
    node "$WORKSPACE_SKILLS/youtube-scout/scripts/pipeline.js" \
      --query "$QUERY $NICHE" \
      --out "$OUT_DIR/youtube-scout" \
      --topN 12 --searchN 30 > /tmp/youtube-scout.log 2>&1
  else
    # Second attempt: broader search
    echo "  ⚠️  Retrying YouTube with broader search..."
    node "$WORKSPACE_SKILLS/youtube-scout/scripts/pipeline.js" \
      --query "$QUERY" \
      --out "$OUT_DIR/youtube-scout" \
      --topN 20 --searchN 100 > /tmp/youtube-scout.log 2>&1
  fi

  # Count videos in latest run
  LATEST_YOUTUBE_RUN=$(find "$OUT_DIR/youtube-scout" -name "posts_ranked.json" 2>/dev/null | sort | tail -1)
  YOUTUBE_VIDEOS=$(count_json_array "$LATEST_YOUTUBE_RUN")
  
  echo "  📊 YouTube Attempt $YOUTUBE_ATTEMPT: found $YOUTUBE_VIDEOS videos"
  
  if [ $YOUTUBE_VIDEOS -ge 4 ]; then
    echo "  ✅ YouTube passed validation ($YOUTUBE_VIDEOS videos)"
    break
  fi
  
  YOUTUBE_ATTEMPT=$((YOUTUBE_ATTEMPT + 1))
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All scouts completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 FINAL COUNTS:"
echo "  • Reddit:       $REDDIT_POSTS posts (need 4+) $([ $REDDIT_POSTS -ge 4 ] && echo '✅' || echo '⚠️')"
echo "  • Twitter:      $TWITTER_POSTS tweets (need 4+) $([ $TWITTER_POSTS -ge 4 ] && echo '✅' || echo '⚠️')"
echo "  • YouTube:      $YOUTUBE_VIDEOS videos (need 4+) $([ $YOUTUBE_VIDEOS -ge 4 ] && echo '✅' || echo '⚠️')"
echo "  • Google News:  $NEWS_ARTICLES articles (need 3+) $([ $NEWS_ARTICLES -ge 3 ] && echo '✅' || echo '⚠️')"
echo ""

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

echo "📄 Combined report: $REPORT_FILE"
echo "✅ Research pipeline complete!"
