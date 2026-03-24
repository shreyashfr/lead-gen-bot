# Scout Audit & Fix — 2026-03-24

## Problem Identified

Vaibhav's pillar "RAG vs pageindex" generated 15 ideas but **lacked Reddit posts and had only 1 YouTube video**. Research revealed:

### Root Causes

1. **Reddit Scout Query Too Specific**
   - Query: "RAG vs pageindex" 
   - Result: 0 posts (empty `top_posts_detailed.json`)
   - Issue: Very narrow query returned nothing
   - Fix: Use broader keywords like "RAG retrieval augmented generation backend system design"
   - Test result: 18 posts ✅

2. **YouTube Scout Query Too Long**
   - Query: "RAG vs pageindex backend engineering system design low-latency systems"
   - Result: 1 video
   - Issue: Long compound query reduces YouTube search recall
   - Fix: Use shorter primary query + append niche separately
   - Test result: 7 videos ✅

3. **No Validation/Retry Logic**
   - Script `run_research.sh` runs scouts once and concatenates results
   - No validation that data meets minimum thresholds
   - No auto-retry if scouts fail
   - **Idea generator received incomplete data silently**

4. **Research Agent Docs vs Implementation Mismatch**
   - Research-agent SKILL.md has detailed validation rules (re-run logic, thresholds, etc.)
   - Pillar-workflow uses `run_research.sh` which **ignores all these rules**
   - Validation is documented but not executed

## Fix Applied

### 1. Created `run_research_fixed.sh`
**New features:**
- ✅ Validates each scout output against minimum thresholds
- ✅ Reddit auto-retry: Attempt 1 (week) → Attempt 2 (month) → Attempt 3 (all-time)
- ✅ YouTube auto-retry: Attempt 1 (normal) → Attempt 2 (broader search)
- ✅ Twitter & Google News: Single run (no retry yet, can add if needed)
- ✅ Displays final counts with ✅/⚠️ status
- ✅ All scouts run in parallel for speed

### 2. Improved Scout Queries
**Reddit Query Template:**
```bash
--niche "RAG retrieval augmented generation backend system design"
```
Instead of: `"RAG vs pageindex"` (too narrow)

**YouTube Query Template:**
```bash
--query "$QUERY $NICHE"
# e.g., --query "RAG retrieval augmented generation backend system design"
--topN 12 --searchN 30
# Retry with --topN 20 --searchN 100 if needed
```
Instead of: Very long compound query

### 3. Test Results

**Old vs New (for "RAG vs pageindex" + "backend engineering system design"):**

| Platform | Old | New | Status |
|----------|-----|-----|--------|
| Reddit | 0 ❌ | 18 ✅ | Fixed with broader query |
| YouTube | 1 ⚠️ | 7 ✅ | Fixed with shorter query + retry |
| Twitter | 10 ✅ | 10 ✅ | Working (no change needed) |
| Google News | 4 ✅ | TBD | Working (minimal change) |

**Validation counts (test with "RAG retrieval augmented generation..."):**
- Reddit: Found 18 posts → all 18 have `permalink` URLs ✅
- YouTube: Found 7 videos → all 7 have watch?v= IDs ✅

## Next Steps

1. **Replace old script** in pillar-workflow to use `run_research_fixed.sh`
2. **Update research-agent SKILL.md** to point to new validation logic
3. **Test on Vaibhav's account** — re-run "RAG vs pageindex" pillar to verify:
   - Gets 15+ ideas
   - Ideas cite Reddit posts + YouTube videos
   - All ideas have source URLs
4. **Monitor future pillar runs** for proper data collection

## Key Learnings

- Scout queries must be **topic-focused, not ultra-specific** ("RAG systems" > "RAG vs pageindex")
- **Validation + retry logic is critical** — don't silently pass incomplete data to idea generator
- **Parallel execution + validation catches errors fast** — build visibility into the pipeline
- Research-agent docs were excellent; just needed implementation in the actual workflow
