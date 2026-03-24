# Reinforcement Learning Fix — Implementation Plan

## Current Architecture (Reactive)

```
User rejects draft
    ↓
reflection-agent triggers (only on rejection)
    ↓
Extracts lesson from feedback
    ↓
Updates voice-memory.json (only rules)
    ↓
Next draft uses updated rules (maybe)
    ↓
If user doesn't reject again → learning is forgotten
```

**Problems:**
- ❌ Only learns from rejections (negative signal)
- ❌ Doesn't learn from approvals (positive signal)
- ❌ Doesn't learn from casual feedback ("good but tone is off")
- ❌ Requires explicit rejection to trigger
- ❌ Consecutive messages not handled as context

---

## Target Architecture (Autonomous)

```
Every user message/interaction
    ↓
Auto-extract feedback (approval, correction, comment)
    ↓
Classify learning type (rule, preference, pattern, correction)
    ↓
Update voice-memory.json with confidence level
    ↓
Validate next output before sending
    ↓
User sees feedback ("✅ Learned...")
    ↓
Pattern reinforced (no regression)
```

---

## 3 Key Changes Needed

### 1. AUTO-EXTRACTION SERVICE (New Component)

**Purpose:** Parse ANY user feedback (approval, comment, rejection) and extract learnings

**Triggers on:**
- ✅ Draft approval ("good!" / thumbs up)
- ❌ Draft rejection ("this doesn't work")
- ⚡ Feedback mid-approval ("approved but tone feels corporate")
- 🎯 Contextual comment ("This hook format works better for me")
- 💬 Casual correction ("Don't use 'paradigm', too AI-y")

**Extracts:**
1. **Hard rules** → Add to `voice_rules.forbidden_phrases` or `voice_rules.required_style`
2. **Preferences** → Add to `voice_lessons` with `confidence: 0.8`
3. **Patterns** → Add to `voice_lessons` with pattern description
4. **Corrections** → Log as past mistake to avoid

**Output:** Auto-updated voice-memory.json

**Storage Pattern:**
```json
{
  "voice_lessons": [
    {
      "lesson": "Avoid word 'noise', use 'signal' instead (sounds less AI)",
      "source": "direct_user_feedback",
      "date": "2026-03-24",
      "format": "all",
      "confidence": 1.0,
      "applied_count": 0,
      "rejection_count": 0
    },
    {
      "lesson": "User prefers conversational tone over formal",
      "source": "pattern_from_feedback",
      "date": "2026-03-24",
      "format": "all",
      "confidence": 0.8,
      "applied_count": 2,
      "rejection_count": 0
    }
  ]
}
```

---

### 2. VALIDATION GATE (Enforce Before Output)

**Purpose:** Validate EVERY draft before it reaches user

**Checks:**
- ❌ Forbidden phrases (hard reject)
- ❌ Forbidden words (hard reject)
- ⚠️ Tone guardrails (soft flag)
- ⚠️ Style violations (soft flag)
- ⚠️ AI patterns (soft flag via ai-humanizer)
- 🎯 Voice lessons (medium reject if confidence > 0.8)

**If fails:**
1. Log violation to reflection_log
2. Auto-regenerate with constraints
3. Re-validate
4. If still fails → escalate to user with reason

**Never send violating content.**

---

### 3. CONSECUTIVE MESSAGE AGGREGATION (Handle Context)

**Purpose:** Batch messages sent within 2-3 seconds as single context

**Implementation:**
```
User sends: "I want a LinkedIn post about RAG"
System: [waiting 2-3 sec for more messages...]

User sends: "Make it beginner-friendly"
System: Combines both into single request:
  "Generate a beginner-friendly LinkedIn post about RAG systems"

Result: Single output respecting both constraints
```

**Where to implement:** dispatcher.js or pillar-workflow entry point

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Create auto-extract service in voice-memory update flow
- [ ] Add TIER 0 rule update (already in reflection-agent, enable it)
- [ ] Update validation gate to reject before output
- [ ] Log all learnings with confidence scores

**File:** New `auto-learn.js` service + updates to voice-guardian.js

### Phase 2: Autonomous Learning (Week 2)
- [ ] Parse approval feedback ("good", thumbs up, etc.) not just rejections
- [ ] Extract patterns from multi-rejection feedback (e.g., "tone too corporate 3x")
- [ ] Implement confidence scoring (1st feedback: 0.6, 2nd: 0.8, 3rd: 1.0)
- [ ] Add "learned" notification to user feedback loop

**Files:** auto-learn.js, reflection-agent.js (approval path)

### Phase 3: Message Batching (Week 3)
- [ ] Aggregate consecutive messages within 2-3 sec
- [ ] Pass full context to content producer
- [ ] Show user: "Combined 2 messages into 1 request"

**Files:** dispatcher.js, pillar-workflow.js

---

## Code Sketch (auto-learn.js)

```javascript
async function extractAndLearnFromFeedback(userId, feedback, contentType) {
  const memory = await readVoiceMemory(userId);
  
  // 1. Classify feedback type
  const feedbackType = classify(feedback); // rejection, approval, correction, preference
  
  // 2. Extract learnings
  const learnings = extract(feedback, feedbackType, contentType);
  
  for (const learning of learnings) {
    // 3. Hard rule?
    if (learning.isHardRule) {
      memory.voice_rules.forbidden_phrases.push(learning.text);
      memory.voice_lessons.push({
        lesson: learning.text,
        source: 'direct_user_feedback',
        date: today(),
        confidence: 1.0  // Hard rule = max confidence
      });
    }
    
    // 4. Soft preference?
    else if (learning.isPreference) {
      const existing = memory.voice_lessons.find(l => l.lesson === learning.text);
      if (existing) {
        existing.confidence = Math.min(1.0, existing.confidence + 0.2);
        existing.applied_count++;
      } else {
        memory.voice_lessons.push({
          lesson: learning.text,
          source: 'pattern_from_feedback',
          confidence: 0.6,  // Start low, increase with repeats
          applied_count: 0
        });
      }
    }
  }
  
  // 5. Save updated memory
  await writeVoiceMemory(userId, memory);
  
  // 6. Return feedback to user
  return {
    learned: learnings.map(l => `✅ Learned: ${l.text}`),
    applied_to: 'all future content'
  };
}
```

---

## Success Metrics

After implementation:

1. **Rule Persistence:** Hard rules never violated again (0 regression)
2. **Auto-Learning:** Learns from approval + rejection + comment (not just rejection)
3. **Context Handling:** Consecutive messages treated as single input with full context
4. **User Feedback:** Every interaction shows what was learned
5. **No Manual LEARN:** Users never need to say "LEARN" — system learns autonomously

---

## Shubham's Feedback Addressed

| Feedback | Current | Solution |
|----------|---------|----------|
| "2 messages treated separately" | ❌ | Message batching (Phase 3) |
| "Violates learned rules (e.g., 'noise')" | ❌ | Validation gate + hard rules (Phase 1) |
| "Needs explicit LEARN command" | ❌ | Autonomous extraction (Phase 2) |
| "Doesn't learn from approvals" | ❌ | Parse all feedback types (Phase 2) |
| "Forgets lessons over time" | ⚠️ | Confidence scoring + enforcement (Phase 1-2) |

---

## Priority: HIGH

This is the **core differentiator** for the Content Engine. Without autonomous learning, it's just a content writer. With it, it becomes a **personalized writing coach that improves with every interaction**.

Shubham is right: Users should never have to repeat themselves.

