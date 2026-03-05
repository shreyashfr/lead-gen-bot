# Content Engine Integration Guide

**Last Updated:** 2026-03-04  
**Location:** `C:\Users\syash\.openclaw\workspace\content-engine`

---

## 🏗️ System Architecture

This content engine is a **self-improving multi-agent system** that learns voice, reflects on failures, and compounds intelligence over time.

### Research Papers Implemented:
- ✅ **MetaGPT SOP Model** - Structured document handoffs between agents
- ✅ **Self-Reflection Paper** - Composite reflection (Explanation + Solution + Instructions)
- ✅ **Reflect-Retry-Reward RL** - Quality-scored reflections feed back into memory

---

## 📁 Folder Structure

```
C:\Users\syash\.openclaw\workspace\
├── content-engine/                    # Main content engine workspace
│   ├── content-engine-architecture.html  # Visual architecture (open in browser)
│   ├── SYSTEM-ARCHITECTURE.md         # Text architecture docs
│   ├── master-doc.md                  # Core positioning & content strategy
│   ├── memory/
│   │   └── voice-memory.json          # Self-improving voice memory (RL updates)
│   ├── competitive-gaps.md            # Gap analysis tracking
│   ├── content-queue.md               # Publishing calendar
│   ├── pending-ideas.md               # Idea backlog
│   ├── performance-log.md             # Content performance tracking
│   └── research-log.md                # Research insights archive
│
├── skills/
│   ├── reddit-scout/                  # 🎯 VIRAL RESEARCH ENGINE
│   │   ├── SKILL.md
│   │   ├── scripts/pipeline.js        # Main scout pipeline
│   │   └── ...
│   │
│   └── content-engine/                # All content engine agents
│       ├── research-agent/            # 🔍 Orchestrates reddit-scout + web research
│       ├── coordinator-agent/         # 🧠 Runs all 4 intelligence streams
│       ├── idea-generator/            # 💡 Generates 15 scored ideas
│       ├── content-producer/          # ✍️ Writes drafts (reads voice-memory)
│       ├── voice-guardian/            # 🛡️ 4-layer validation + AI detection
│       ├── reflection-agent/          # 🪞 Composite reflections on rejections
│       ├── competitive-tracker/       # 🕵️ Tracks competitor content
│       ├── performance-tracker/       # 📊 Analyzes what works
│       ├── feed-intelligence/         # 📡 Real-time trend monitoring
│       └── pillar-workflow/           # 🎬 End-to-end trigger → publish flow
│
└── reddit-scout/                      # Reddit scout output storage
    └── <niche-slug>/
        └── runs/<timestamp>/
            ├── report.md              # Human-readable insights + viral ideas
            ├── posts_ranked.json      # Scored viral posts
            ├── top_posts_detailed.json # Full post + comments
            └── cards/*.png            # Reddit-style card images
```

---

## 🔄 How Reddit-Scout Integrates

### Phase 1: Ideas Generation (Initial Research)

**reddit-scout** is the **primary source** for viral content discovery in the research phase.

#### Flow:
```
User: "pillar: AI career transitions"
  ↓
pillar-workflow triggers
  ↓
research-agent (STAGE 1)
  ↓
  🎯 reddit-scout runs:
     • Discovers subreddits for "AI career transitions"
     • Fetches 200+ posts (top/hot/rising + global search)
     • Scores by viral potential (velocity + engagement + ratio)
     • Selects top 10 posts with full context
     • Generates pattern analysis
     • Outputs: report.md + cards + viral ideas
  ↓
Research report compiled (trending angles + hooks + gaps)
  ↓
coordinator-agent (STAGE 2)
  • Merges reddit-scout insights with:
    - Google News
    - Twitter trends
    - LinkedIn scanning
    - Competitor analysis
  ↓
idea-generator (STAGE 3)
  • Generates 15 scored ideas
  • Uses reddit-scout patterns for hook/angle inspiration
```

### Why Reddit-Scout First?

1. **Unfiltered truth** - Real conversations, not polished content
2. **Viral signals** - Built-in engagement metrics (upvotes, comments, velocity)
3. **Gap discovery** - See what questions remain unanswered
4. **Hook patterns** - Study what grabs attention in the wild
5. **Emotion mapping** - Identify what resonates (fear, curiosity, anger, inspiration)

---

## 🧠 Voice Memory System

**Location:** `content-engine/memory/voice-memory.json`

### Structure:
```json
{
  "voice_rules": {...},           // Tone, POV, forbidden phrases
  "pre_write_signal": {...},      // Last rejection → immediate retry signal
  "hook_patterns": [...],         // High-performing hook templates
  "voice_lessons": [...],         // RL-derived lessons (quality-scored)
  "feedback_log": [...],          // Raw rejection data + reflections
  "rl_metrics": {...},            // Approval rates, failure categories
  "story_bank": [...],            // Personal stories mapped to themes
  "competitor_gaps": [...]        // Market gaps from competitive-tracker
}
```

### Self-Improvement Loop:

1. **Rejection happens** → voice-guardian or human rejects draft
2. **Composite reflection** → 3-part analysis (Explanation + Solution + Instructions)
3. **Quality scoring** → Is it specific? Is it generalizable?
4. **Immediate signal** → `pre_write_signal` updates before next draft
5. **Batch learning** → Every 5 rejections → pattern analysis → new `voice_lesson`

---

## 🚀 Usage Patterns

### Trigger a Full Pillar Run

```
User: "pillar: AI job displacement fears"
```

**What happens:**
1. ✅ reddit-scout deep dive (5-7 min)
2. ✅ Web research (Google News, Twitter, LinkedIn)
3. ✅ Competitive audit
4. ✅ Performance pattern analysis
5. ✅ Strategic brief compiled
6. ✅ 15 ideas generated (scored, with hooks)
7. ⏸️ User picks ideas (e.g. "1, 3, 7")
8. ✅ Content producer writes drafts
9. ✅ Voice guardian validates (4 layers)
10. ✅ Approval loop (accept/reject/edit)

### Quick Reddit Scout Only

```
User: "reddit scout for AI salaries"
```

**What happens:**
- Runs standalone scout
- Outputs report + cards + viral ideas
- Saves to `reddit-scout/ai-salaries/runs/<timestamp>/`

### Check Voice Memory Status

```
User: "show voice-memory stats"
```

**Agent reads:**
```json
{
  "total_drafts": 47,
  "total_rejections": 12,
  "approval_rate_by_format": {
    "LinkedIn": 0.78,
    "Twitter Thread": 0.82
  },
  "avg_reflection_quality": 8.1,
  "top_failure_category": "hook_failure"
}
```

---

## 🔧 Configuration

### Reddit-Scout Settings

Default command in research-agent:
```powershell
node C:\Users\syash\.openclaw\workspace\skills\reddit-scout\scripts\pipeline.js \
  --niche "[topic]" \
  --out "C:\Users\syash\.openclaw\workspace\reddit-scout" \
  --topN 10 \
  --subLimit 8 \
  --gapMs 1200 \
  --time week \
  --kinds top,hot,rising \
  --searchAuto 1 \
  --printChat 1
```

**Adjust based on needs:**
- `--topN 15` for more ideas
- `--time day` for breaking trends
- `--time month` for evergreen content
- `--minSubscribers 500000` to focus on large subs only

### Voice Guardian Thresholds

In `voice-memory.json`:
```json
{
  "guardian_settings": {
    "tone_match_threshold": 0.75,
    "ai_detection_threshold": 0.25,
    "forbidden_phrase_strict": true
  }
}
```

---

## 📊 Monitoring & Improvement

### Check System Health

```
User: "content engine status"
```

Agent reports:
- Last pillar run timestamp
- Approval rate trend
- Top failure categories
- Voice lessons learned (last 5)
- Reddit-scout run count

### Review Failed Drafts

```
User: "show last 5 rejections"
```

Agent reads `voice-memory.json → feedback_log` and displays:
- Format, pillar, rejection reason
- Reflection quality score
- Whether it contributed to a voice_lesson

### Update Voice Rules

```
User: "add forbidden phrase: 'crushing it'"
```

Agent updates `voice-memory.json → voice_rules.forbidden_phrases`

---

## 🎯 Best Practices

### 1. Run Reddit-Scout Regularly
- **Weekly:** Keep pulse on trending topics
- **Before major campaigns:** Deep-dive into niche
- **After competitor posts:** See what's resonating

### 2. Review Voice Lessons
- Check `voice_lessons` monthly
- Remove outdated lessons (voice evolves)
- Promote high-quality reflections to `voice_rules`

### 3. Track Performance Patterns
- Log every published post to `performance-log.md`
- Update `voice-memory.json → rl_metrics` monthly
- Identify which formats/topics work best

### 4. Maintain Story Bank
- Add new personal stories to `voice-memory.json → story_bank`
- Tag with themes (resilience, failure, pivot, learning)
- Track which stories drive highest engagement

---

## 🔗 Key Files Quick Reference

| File | Purpose | Who Reads/Writes |
|------|---------|------------------|
| `content-engine-architecture.html` | Visual system map | Human (open in browser) |
| `voice-memory.json` | Self-improving memory | All agents read; RL-updater writes |
| `master-doc.md` | Core positioning & strategy | Research/coordinator read |
| `content-queue.md` | Publishing calendar | Performance-tracker writes |
| `competitive-gaps.md` | Market gap analysis | Competitive-tracker writes |
| `reddit-scout/.../report.md` | Viral insights per niche | reddit-scout writes; research-agent reads |

---

## 🚨 Troubleshooting

### Reddit-Scout Fails
- Check User-Agent is set
- Verify `--gapMs` ≥ 1000 (rate limiting)
- Reduce `--subLimit` if hitting API limits
- Check `reddit-scout/.../run_meta.json` for errors

### Voice Guardian Rejects Everything
- Review `voice-memory.json → voice_rules`
- Check if `forbidden_phrases` too strict
- Lower `tone_match_threshold` temporarily
- Review AI detection threshold (may need calibration)

### Ideas Feel Repetitive
- Clear `reddit-scout/<niche>/seen.json`
- Expand keyword search in reddit-scout
- Add new subreddits to discovery
- Check `voice_lessons` for overfitting

---

## 📚 Further Reading

- **Architecture HTML:** Open `content-engine-architecture.html` in browser for interactive diagrams
- **System Architecture:** Read `SYSTEM-ARCHITECTURE.md` for detailed agent logic
- **Reddit-Scout Docs:** Read `skills/reddit-scout/SKILL.md` for full scout capabilities
- **Research Papers:**
  - MetaGPT: https://arxiv.org/abs/2308.00352
  - Self-Reflection: https://arxiv.org/abs/2303.11366
  - Reflect-Retry-Reward: [Internal reference]

---

**Questions?** Update this doc as the system evolves. Treat it as living documentation.
