# Content Engine System Map

**Quick visual reference for the integrated system**

---

## 📍 File Structure

```
C:\Users\syash\.openclaw\workspace\
│
├── 🎯 content-engine/                    # MAIN CONTENT WORKSPACE
│   ├── README.md                         # Start here!
│   ├── INTEGRATION.md                    # Full system docs
│   ├── SYSTEM-MAP.md                     # ← You are here
│   ├── content-engine-architecture.html  # Visual architecture (OPEN IN BROWSER!)
│   ├── SYSTEM-ARCHITECTURE.md
│   │
│   ├── 📋 CONTENT FILES
│   │   ├── master-doc.md                 # Core strategy & positioning
│   │   ├── content-queue.md              # Publishing calendar
│   │   ├── pending-ideas.md              # Idea backlog
│   │   ├── competitive-gaps.md           # Market gap tracking
│   │   ├── performance-log.md            # Performance tracking
│   │   └── research-log.md               # Research archive
│   │
│   └── 🧠 memory/
│       └── voice-memory.json             # Self-improving RL memory
│
├── 🔍 reddit-scout/                      # REDDIT OUTPUTS
│   └── <niche-slug>/
│       └── runs/<timestamp>/
│           ├── report.md                 # Human-readable insights
│           ├── posts_ranked.json         # Scored posts
│           ├── top_posts_detailed.json   # Full context
│           └── cards/*.png               # Visual cards
│
└── 🛠️ skills/
    │
    ├── reddit-scout/                     # VIRAL RESEARCH ENGINE
    │   ├── SKILL.md
    │   ├── scripts/
    │   │   ├── pipeline.js               # Main scout
    │   │   ├── render_cards.js           # PNG renderer
    │   │   └── score.js                  # Viral scoring
    │   └── ...
    │
    └── content-engine/                   # ALL AGENT SKILLS
        ├── 🔍 research-agent/            # Orchestrates reddit-scout + web
        ├── 🧠 coordinator-agent/         # 4 intelligence streams
        ├── 💡 idea-generator/            # 15 scored ideas
        ├── ✍️ content-producer/          # Writes drafts
        ├── 🛡️ voice-guardian/            # 4-layer validation
        ├── 🪞 reflection-agent/          # Composite reflections
        ├── 📊 performance-tracker/       # Performance analysis
        ├── 🕵️ competitive-tracker/       # Gap analysis
        ├── 📡 feed-intelligence/         # Trend monitoring
        └── 🎬 pillar-workflow/           # Full orchestrator
```

---

## 🔄 Data Flow Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INPUT                                  │
│                 "pillar: [topic]"                                │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  🎬 pillar-workflow/SKILL.md                                     │
│  Reads: USER.md, master-doc.md                                   │
│  Triggers: research-agent                                        │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  🔍 research-agent/SKILL.md                                      │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ PRIMARY: reddit-scout                                 │       │
│  │ Location: skills/reddit-scout/scripts/pipeline.js    │       │
│  │ Output: reddit-scout/<niche>/runs/<timestamp>/       │       │
│  │ - report.md (insights + viral ideas)                 │       │
│  │ - posts_ranked.json (scored posts)                   │       │
│  │ - cards/*.png (visual cards)                         │       │
│  └──────────────────────────────────────────────────────┘       │
│  Supplements with:                                               │
│  • Google News (web_search)                                      │
│  • Twitter trends (web_search)                                   │
│  • LinkedIn scanning (web_fetch)                                 │
│  Outputs: research_brief.json → message pool                     │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  🧠 coordinator-agent/SKILL.md                                   │
│  Reads: research_brief.json                                      │
│  Runs 4 streams:                                                 │
│  1. Trend psychology analysis                                    │
│  2. Competitive audit (reads: competitive-gaps.md)               │
│  3. Performance review (reads: performance-log.md)               │
│  4. Strategic synthesis                                          │
│  Outputs: strategic_brief.json → message pool                    │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  💡 idea-generator/SKILL.md                                      │
│  Reads: strategic_brief.json                                     │
│  Reads: voice-memory.json (story_bank, hook_patterns)            │
│  Generates: 15 scored ideas                                      │
│  Format: {hook, angle, format, story_id, why_it_works, TRS}      │
│  Outputs: idea_list.json → message pool                          │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
                   USER PICKS IDEAS
                  "1, 3, 7" (example)
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  ✍️ content-producer/SKILL.md                                    │
│  Reads:                                                          │
│  • voice-memory.json (voice_rules, hook_patterns, voice_lessons)│
│  • pre_write_signal (last rejection context)                     │
│  • idea_list.json (selected ideas)                               │
│  Writes: draft_content.json → message pool                       │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  🛡️ voice-guardian/SKILL.md                                     │
│  4-Layer Validation:                                             │
│  ✓ Layer 1: Forbidden phrase check (deterministic)              │
│  ✓ Layer 2: Format rules check (deterministic)                  │
│  ✓ Layer 3: Tone match score (LLM-judged, ≥0.75)                │
│  ✓ Layer 4: AI detection API (≤0.25)                            │
│  Outputs: guardian_result.json → message pool                    │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
                ┌────────┴────────┐
                │                 │
             PASS              FAIL
                │                 │
                ↓                 ↓
          USER APPROVAL    ┌──────────────────────────────────┐
                │          │  🪞 reflection-agent/SKILL.md    │
                │          │  Reads: rejection_event.json     │
        ┌───────┴────┐     │  Generates:                     │
        │            │     │  1. EXPLANATION (why?)          │
    APPROVED     REJECTED  │  2. SOLUTION (step-by-step)     │
        │            │     │  3. INSTRUCTIONS (rules)        │
        ↓            │     │  Quality score: 1-10            │
   PUBLISH to        │     │  Outputs: reflection.json       │
   content-queue.md  │     └──────────────┬──────────────────┘
                     │                    ↓
                     │     ┌──────────────────────────────────┐
                     │     │  🔄 RL MEMORY UPDATER            │
                     │     │  Reads: reflection.json          │
                     │     │  Updates:                        │
                     │     │  • pre_write_signal (immediate)  │
                     │     │  • feedback_log entry            │
                     │     │  [Every 5 rejections]            │
                     │     │  • Pattern analysis              │
                     │     │  • New voice_lesson              │
                     │     │  Writes: voice-memory.json       │
                     │     └──────────────────────────────────┘
                     │                    │
                     └────────────────────┘
                                ↓
                         RETRY LOOP
                   (with updated memory)
```

---

## 🧠 Voice Memory Structure

```json
voice-memory.json
├── voice_rules              ← Tone, POV, forbidden phrases
│   ├── forbidden_phrases[]
│   ├── required_style{}
│   ├── tone_guardrails{}
│   └── hook_rules[]
│
├── pre_write_signal         ← Last rejection (immediate retry signal)
│   ├── last_rejection_format
│   ├── last_rejection_reason
│   └── timestamp
│
├── hook_patterns[]          ← High-performing hooks
│   └── {pattern, avg_trs, best_formats}
│
├── voice_lessons[]          ← RL-derived (quality-scored)
│   └── {id, lesson, derived_from_rejections[], quality_score, category}
│
├── feedback_log[]           ← Raw rejection data
│   └── {id, format, pillar, rejection_reason, reflection{}, timestamp}
│
├── rl_metrics               ← Performance tracking
│   ├── total_drafts
│   ├── approval_rate_by_format{}
│   └── top_failure_category
│
├── competitor_gaps[]        ← From competitive-tracker
│
└── story_bank[]             ← Personal stories mapped to themes
    └── {id, summary, themes[], used_count, avg_trs}
```

---

## 🎯 Agent Read/Write Permissions

| Agent | Reads | Writes |
|-------|-------|--------|
| **research-agent** | master-doc.md | research_brief.json |
| **coordinator-agent** | research_brief.json, competitive-gaps.md, performance-log.md | strategic_brief.json |
| **idea-generator** | strategic_brief.json, voice-memory.json (story_bank, hook_patterns) | idea_list.json |
| **content-producer** | idea_list.json, voice-memory.json (voice_rules, hook_patterns, voice_lessons, pre_write_signal) | draft_content.json |
| **voice-guardian** | draft_content.json, voice-memory.json (voice_rules) | guardian_result.json |
| **reflection-agent** | rejection_event.json | reflection.json |
| **RL-updater** | reflection.json | voice-memory.json |
| **performance-tracker** | content-queue.md | performance-log.md, rl_metrics |
| **competitive-tracker** | (external sources) | competitive-gaps.md |

---

## 🚀 Usage Patterns

### Full Pipeline
```
pillar: AI career transitions
```
**Time:** ~15-20 min  
**Output:** Strategic brief → 15 ideas → drafts → validation

---

### Reddit-Scout Only
```
reddit scout for remote work
```
**Time:** ~5-7 min  
**Output:** `reddit-scout/remote-work/runs/<timestamp>/report.md`

---

### Quick Status Check
```
content engine status
```
**Shows:**
- Last run timestamp
- Approval rate by format
- Top failure categories
- Voice lessons learned

---

### Memory Review
```
show voice-memory stats
```
**Shows:**
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

## 🔗 Key Files Quick Lookup

| Need | Open This |
|------|-----------|
| **Visual architecture** | `content-engine-architecture.html` (browser) |
| **Quick start** | `content-engine/README.md` |
| **Full docs** | `content-engine/INTEGRATION.md` |
| **This map** | `content-engine/SYSTEM-MAP.md` |
| **Voice memory** | `content-engine/memory/voice-memory.json` |
| **Content strategy** | `content-engine/master-doc.md` |
| **Publishing calendar** | `content-engine/content-queue.md` |
| **Reddit insights** | `reddit-scout/<niche>/runs/<timestamp>/report.md` |
| **Research skill** | `skills/content-engine/research-agent/SKILL.md` |
| **Reddit scout skill** | `skills/reddit-scout/SKILL.md` |

---

## 🎨 Visual Architecture

**Must see!** Open this in your browser for interactive Mermaid diagrams:

```
C:\Users\syash\.openclaw\workspace\content-engine\content-engine-architecture.html
```

Shows:
- Full pipeline flow
- RL reflection loop
- Voice-memory schema
- Agent communication layer
- Voice guardian 4-layer validation

---

## ✅ Integration Checklist

- ✅ 10 content-engine skills migrated
- ✅ reddit-scout integrated into research-agent
- ✅ Voice memory structure set up
- ✅ File storage paths configured
- ✅ Documentation complete (README, INTEGRATION, SYSTEM-MAP)
- ✅ Architecture HTML included
- ✅ All skills reference correct paths

**Status:** 🟢 READY TO USE

---

**Next:** Try `pillar: [your topic]` and watch the magic! 🚀
