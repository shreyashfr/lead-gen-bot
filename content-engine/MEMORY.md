# MEMORY.md — Long-Term Learnings

## RL-Powered Content System (Session: 2026-02-23)

### The Vision
Revenue-optimized content pipeline for AI mentorship program. Not vanity metrics—actual cash.

### Core Framework
1. **Reward Function** — True Reward Score (TRS) tied to revenue derivatives:
   - 0.4 × Qualified DMs (intent signal)
   - 0.3 × Webinar Signups (mid-funnel)
   - 0.2 × Profile Clicks (curiosity)
   - 0.1 × Engagement Velocity (amplification)
   - Future: Direct revenue attribution

2. **Action Space** — What we experiment with:
   - Hook archetype (fear, contrarian, authority, data-backed, story)
   - Narrative frame (job loss panic, skill gap, opportunity, etc)
   - CTA type (DM, comment, webinar link, no CTA)
   - Timing (hour of day, day of week, news cycle)
   - Content density (short vs long)
   - Structure (problem-solution, hero's journey, before-after)
   - Audience segment (entry-level, mid, senior, founders, hiring managers)

3. **Strategic Boundaries** — Exploration only within:
   - AI careers
   - ML systems
   - Skill compounding
   - AI economics
   - Founder/tech scaling
   
   NOT: random politics, unrelated industries, off-brand angles

4. **Contextual Bandits** — Learn which actions work with which contexts:
   - "Contrarian hook + Data + DM CTA works best on Tuesday mornings with ML engineers"
   - Not: "This hook is universally best"
   - Thompson Sampling for natural exploration-exploitation

### Measurement Infrastructure
- Post-level tracking (metrics for every single post)
- DM pipeline (source post → qualified signal → webinar signup)
- Webinar cohort (signup → attendance → purchase → LTV)
- Revenue attribution (trace mentee back to originating post)
- Time-decay (old posts don't pollute RL decisions)

### Integration Points
1. **Coordinator Agent** — generates ideas informed by high-performing contexts
2. **Content Producer** — writes with optimal timing/density/structure metadata
3. **Voice Guardian** — validates brand alignment + checks for reward hacking
4. **New: RL Analyst** — weekly analysis of patterns, Thompson Sampling updates
5. **New: Attribution Tracker** — traces revenue per post continuously

### Long-Term Trajectory
- Month 1-2: Foundation (TRS 3-5, gathering data)
- Month 3-4: Patterns emerge (TRS 5-7, finding winners)
- Month 5-6: Exploitation begins (TRS 7-9, revenue signals visible)
- Month 7-12: Compounding (TRS 8-10, content becomes major channel)
- Year 2+: Moat building (proprietary data → franchise potential)

### Key Decision Points
- **Reward Function**: Revenue-weighted vs pure TRS (lean toward revenue)
- **Exploration Budget**: 80% exploit / 20% explore ratio
- **Data Freshness**: Only use last 30 days for RL model
- **Audience Targeting**: Start with ML engineers (highest-intent), expand later
- **Tracking Complexity**: MVP is post-level + DM-level, add attribution layer in Month 2

### Brainstorm Outputs (2026-02-23)
- 12-layer system design document
- Action space dimensionality: ~50 discrete actions (vs current 15)
- Risk mitigation: reward hacking, data leakage, sample size, context explosion, audience drift
- Dashboard framework: weekly metrics, pattern detection, hypothesis testing
- Integration architecture: how RL wires into existing Coordinator/Producer/Guardian

### Next Steps (When Ready)
1. Build tracking infrastructure (JSON schema for post metrics)
2. Implement TRS formula in spreadsheet or code
3. Publish 5-10 posts with explicit (context, action) metadata
4. Analyze patterns manually first (before automation)
5. Build RL Analyst skill
6. Launch contextual bandit model

### Files to Create/Update
- `rl-performance.json` — post-level metrics log
- `rl-analysis-[date].md` — weekly pattern analysis
- `hypothesis-tests.md` — systematic A/B testing log
- `voice-memory.json` — add RL learnings section

---

**Status**: Brainstorm complete. System design ready. No code written yet. Decision point: What layer to build first?
