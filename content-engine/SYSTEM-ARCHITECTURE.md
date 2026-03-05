# Content Operating System — Architecture Overview

**Status:** Live as of 2026-02-22
**Model:** 8-Agent Sequential Pipeline with Self-Improving Voice Intelligence

---

## The Intelligence Pipeline (Linear Execution)

When you send `pillar: [topic]`, this is what happens:

### 1️⃣ Coordinator Agent (Single Session)
**Input:** Pillar topic, master-doc.md, voice-memory.json
**Actions (sequential within one session):**
1. Research Deep Dive — Scans Reddit, Google News, HBR, X, LinkedIn
2. Trend Psychology — Extracts emotional patterns, oversaturated angles
3. Competitive Audit — Analyzes Ayush's past posts + 10 competitor accounts
4. Performance Review — Identifies what worked for Ayush historically
5. Strategic Synthesis — Merges all 4 findings into coherent brief
6. Idea Generation — Produces 15 ideas with hooks, angles, format fit
**Output:** Strategic brief + 15 ideas
**Memory:** Updates voice-memory.json with sources checked, competitors audited

### 2️⃣ Content Producer
**Input:** Selected ideas from Ayush
**Action:** Writes one draft at a time, reads master-doc.md + voice-memory.json
**Output:** Draft (not sent to Ayush yet)

### 3️⃣ Voice Guardian (Quality Gate)
**Input:** Draft from Content Producer
**Action:** Validates against voice-memory.json
- Checks: forbidden phrases, tone, AI detectability test, style requirements
- If fails: flags issues, Producer rewrites
- If passes: sends to Ayush
**Output:** Approved draft or rewrite request
**Memory:** Logs validation results

### 4️⃣ Approval Loop
**Input:** Ayush feedback (approved / rejected / fix this)
**Action:**
- If approved: push to Airtable, log to content-queue.md, move to next piece
- If feedback: Producer rewrites, Voice Guardian revalidates, resend
**Memory:** Logs feedback to voice-memory.json for self-improvement
**Every 5 entries:** Analyze for patterns, update voice lessons

---

## The Brain: voice-memory.json

This is NOT markdown. This is structured JSON that every agent reads before executing.

### What It Contains

```json
{
  "voice_rules": {
    "forbidden_phrases": [ "leverage", "utilize", ... ],
    "required_style": { "lowercase": true, "contractions": true, ... },
    "tone_guardrails": { ... }
  },
  "high_performers": {
    "hooks": [ past hooks that worked well ],
    "formats_by_platform": { ... },
    "emotional_archetypes": [ what resonates ]
  },
  "agent_logs": {
    "research_agent": { "last_run": "2026-02-22", "sources_checked": [ ... ] },
    "competitive_auditor": { "accounts_audited": [ ... ] },
    ...
  },
  "feedback_log": [ 
    { "date": "...", "issue_type": "hook", "what_was_wrong": "...", "what_fixed_it": "..." },
    ...
  ],
  "voice_lessons": [
    { "lesson": "no em dashes ever", "context": "rewrite sentences", "first_detected": "2026-02-22" },
    ...
  ]
}
```

### Self-Improvement Loop

1. **You reject/edit a draft**
2. Content Producer rewrites it
3. **Feedback logged to voice-memory.json:**
   ```json
   {
     "date": "2026-02-22",
     "format": "LinkedIn post",
     "issue_type": "hook",
     "what_was_wrong": "felt too generic",
     "what_fixed_it": "added specific number from master-doc"
   }
   ```
4. **Every 5 entries:** Coordinator analyzes patterns
5. **New voice lesson added:** `voice_lessons` array updated
6. **Next session:** All agents read updated JSON, apply new lessons

Example: If you reject 5 hooks for being "too formal," a lesson gets added: "Hooks should sound conversational, not corporate-formal." Next run, idea generator produces better hooks automatically.

---

## File Structure

```
~/.openclaw/workspace/
├── SOUL.md (constitution + architecture overview)
├── master-doc.md (voice, stories, positioning, hook library)
├── voice-memory.json (intelligence layer — structures rules + feedback + lessons)
├── pending-ideas.md (saved ideas between sessions)
├── content-queue.md (approved content log)
├── research-log.md (cumulative research archive)
├── AGENTS.md (workspace guidelines)
├── USER.md (about Ayush)
├── TOOLS.md (local setup — Airtable, SSH, etc)
└── skills/
    ├── coordinator-agent/
    ├── content-producer/ (updated)
    ├── voice-guardian/ (new)
    ├── pillar-workflow/ (updated)
    ├── feed-intelligence/
    ├── competitive-tracker/
    ├── performance-tracker/
    ├── research-agent/
    └── idea-generator/
```

---

## How to Use This System

### Day 1: Set a Pillar
```
you: pillar: job loss cos of ai
system: (coordinator runs research, trend, competitive, performance in one session)
system: → generates strategic brief
system: → produces 15 ideas
coordinator: Here are 15 ideas for "job loss cos of ai". Pick which ones you want.
```

### Day 2: Select Ideas
```
you: go with 1, 3, 5, 8, 11
system: (assigns formats to hit 22-piece target, starts production)
```

### Day 3-7: Approve Content
```
you: (producer writes piece 1)
system: (voice guardian validates)
system: (sends to you)
you: approved
system: (pushes to Airtable + queue, moves to next piece)

you: (producer writes piece 2)
system: (voice guardian validates)
system: (sends to you)
you: hook feels too generic
system: (producer rewrites, voice guardian revalidates)
system: (sends revised version)
you: approved
system: (next piece)
```

### Each Session
- System reads voice-memory.json before every draft
- System logs every correction you give
- System extracts patterns every 5 corrections
- System improves automatically without manual instruction
- No sub-agent pairing issues, clean linear execution

---

## Key Changes from Previous System

| Aspect | Before | After |
|--------|--------|-------|
| Research | Manual sources | Automated deep dive (single session) |
| Memory | Markdown only | JSON intelligence layer |
| Voice Validation | Manual (read-through) | Automated (Voice Guardian before you see it) |
| Self-Improvement | Manual instruction updates | Automatic (JSON feedback loops) |
| Duplication Prevention | None | Agent logs prevent rescans |
| Infrastructure | Linear, no intelligence merge | Coordinator: research + trend + competitive + performance merged |
| Sub-Agents | None | Coordinator is single comprehensive session, no pairing overhead |

---

## Costs + Performance

- **Faster research:** 4 agents work sequentially (not parallel), reducing wait time vs. manual research
- **Better ideas:** Ideas generated from merged strategic brief, not raw research
- **Fewer rewrites:** Voice Guardian catches tone issues before they reach you
- **Auto-improvement:** Feedback loop means drafts get better each session without instruction changes
- **No duplication:** Agent logs prevent analyzing the same sources/accounts twice

---

## Ready to Test

The system is now:
✅ Single-agent coordinator (no sub-agent pairing issues)
✅ Intelligence merging (research + trend + competitive + performance)
✅ Voice Guardian validation (before drafts reach you)
✅ JSON self-improvement (feedback → patterns → voice lessons)
✅ Linear, clean, production-ready

Next: Run `pillar: job loss cos of ai`

The Coordinator will:
1. Scan sources + extract research
2. Analyze emotional patterns
3. Audit competitors
4. Review Ayush's performance
5. Merge into strategic brief
6. Generate 15 ideas
7. Send for your selection

Then: Production with Voice Guardian validation + auto-improvement.

---

*Last updated: 2026-02-22*
*Architecture v2.0 — Linear, No Sub-Agent Overhead*
