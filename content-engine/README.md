# 🚀 Self-Improving Content Engine

**Version:** 2.0  
**Last Updated:** 2026-03-04  
**Owner:** Shreyash

---

## What This Is

A **research-backed multi-agent content system** that:

1. 🔍 **Discovers viral content** via Reddit JSON scraping (reddit-scout)
2. 🧠 **Generates strategic ideas** from real-time research
3. ✍️ **Writes in your voice** (learns from rejections)
4. 🛡️ **Self-validates** with 4-layer quality checks
5. 🪞 **Reflects on failures** to improve over time
6. 📊 **Tracks performance** to optimize future content

---

## Quick Start

### 1. Run a Full Content Pillar

```
pillar: AI career transitions
```

This triggers:
- Reddit-scout deep dive
- Web research (Google/Twitter/LinkedIn)
- Competitive analysis
- 15 scored ideas
- Draft production
- Voice validation

**Time:** ~15-20 minutes for full cycle

---

### 2. Quick Reddit Scout

```
reddit scout for remote work productivity
```

**Output:**
- `reddit-scout/remote-work-productivity/runs/<timestamp>/report.md`
- Top 10 viral posts with cards
- Pattern analysis
- Content ideas derived from posts

**Time:** ~5-7 minutes

---

### 3. Review System Performance

```
show voice-memory stats
```

See approval rates, failure patterns, lessons learned.

---

## Architecture

### Core Pipeline

```
USER INPUT
  ↓
reddit-scout (viral discovery)
  ↓
research-agent (web + trends)
  ↓
coordinator-agent (strategic synthesis)
  ↓
idea-generator (15 scored ideas)
  ↓
USER PICKS IDEAS
  ↓
content-producer (writes drafts)
  ↓
voice-guardian (4-layer validation)
  ↓
USER APPROVAL
  ↓
[if rejected] → reflection-agent → RL memory update
  ↓
PUBLISH
```

### Agent Skills

| Skill | Purpose |
|-------|---------|
| `research-agent` | Orchestrates reddit-scout + web research |
| `coordinator-agent` | Runs 4 intelligence streams sequentially |
| `idea-generator` | Generates 15 scored content ideas |
| `content-producer` | Writes drafts in learned voice |
| `voice-guardian` | 4-layer validation (rules + tone + AI detection) |
| `reflection-agent` | Composite reflections on rejections |
| `performance-tracker` | Analyzes what works |
| `competitive-tracker` | Tracks market gaps |
| `feed-intelligence` | Real-time trend monitoring |
| `pillar-workflow` | End-to-end orchestrator |

---

## Reddit-Scout Integration

**reddit-scout** is the **primary viral research engine** in Phase 1.

### What It Does:
1. Discovers relevant subreddits automatically
2. Fetches 200+ posts (top/hot/rising + global search)
3. Scores by viral potential (velocity + engagement ratio)
4. Extracts full context (selftext + top comments)
5. Generates pattern analysis
6. Outputs report + card images + viral ideas

### Why It's Powerful:
- **Unfiltered truth** - Real conversations, not polished marketing
- **Built-in signals** - Upvotes, comments, velocity = proven resonance
- **Hook discovery** - Study what grabs attention in the wild
- **Gap analysis** - See what questions go unanswered
- **Emotion mapping** - Identify fear, curiosity, anger, inspiration

---

## Voice Memory

**Location:** `memory/voice-memory.json`

### Self-Improvement Loop:

```
REJECTION
  ↓
Composite Reflection
(Explanation + Solution + Instructions)
  ↓
Quality Scoring
(Specific? Generalizable?)
  ↓
Pre-Write Signal Update
(immediate retry boost)
  ↓
[Every 5 rejections]
  ↓
Pattern Analysis
  ↓
New Voice Lesson Added
```

### What Gets Learned:
- Hook patterns that work
- Phrases to avoid
- Tone calibration
- Format-specific rules
- Story-to-theme mappings

---

## File Structure

```
content-engine/
├── README.md                          ← You are here
├── INTEGRATION.md                     ← Full system docs
├── content-engine-architecture.html   ← Visual map (open in browser)
├── SYSTEM-ARCHITECTURE.md             ← Text architecture
│
├── master-doc.md                      ← Core positioning & strategy
├── competitive-gaps.md                ← Market gap tracking
├── content-queue.md                   ← Publishing calendar
├── pending-ideas.md                   ← Idea backlog
├── performance-log.md                 ← Performance tracking
├── research-log.md                    ← Research archive
│
└── memory/
    └── voice-memory.json              ← Self-improving memory
```

---

## Research Papers Implemented

✅ **MetaGPT** - Structured agent communication (SOP model)  
✅ **Self-Reflection Paper** - Composite reflections > simple retry  
✅ **Reflect-Retry-Reward** - Quality-scored reflections feed RL loop

---

## Monitoring

### Check System Health
```
content engine status
```

### Review Failed Drafts
```
show last 5 rejections
```

### Update Voice Rules
```
add forbidden phrase: 'game changer'
```

---

## Best Practices

1. **Run reddit-scout weekly** to stay current
2. **Review voice lessons monthly** and prune outdated ones
3. **Log every published post** to performance-log.md
4. **Update story bank** with new personal narratives
5. **Calibrate thresholds** based on approval rate trends

---

## Troubleshooting

### Reddit-Scout Issues
- Check User-Agent header
- Increase `--gapMs` (rate limiting)
- Reduce `--subLimit`

### Guardian Too Strict
- Review `voice_rules.forbidden_phrases`
- Lower `tone_match_threshold`
- Calibrate AI detection threshold

### Repetitive Ideas
- Clear `seen.json` for niche
- Expand keyword search
- Add new subreddit sources

---

## Next Steps

1. **Read:** `INTEGRATION.md` for detailed workflows
2. **View:** `content-engine-architecture.html` for visual system map
3. **Run:** Your first pillar with `pillar: [topic]`
4. **Monitor:** Voice-memory improvements over time

---

**Ready to start?** Try: `pillar: AI job market trends`
