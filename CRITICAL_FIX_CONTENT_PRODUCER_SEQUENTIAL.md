# CRITICAL FIX: Content Producer — Sequential One-by-One Workflow

## 🔴 PROBLEM

Content-producer spawned pieces #2-13 in parallel showing multiple pieces at once:
```
Piece #2 is done. Now spawning pieces #8-13:
Spawning piece #9:
Spawning piece #10:
Spawning piece #11:
Limit reached again (5/5). Let me wait for more completions:
```

**Wrong behavior:**
- Parallel generation (all 12 pieces at once)
- Multiple pieces sent for review simultaneously
- User feedback on piece #10 while pieces #2-9 still showing
- Confusing UX (too much content)
- System doesn't wait for approval before next piece

---

## ✅ SOLUTION: SEQUENTIAL ONE-BY-ONE

**Correct workflow:**

1. User approves production plan (e.g. "5x LinkedIn Posts")
2. Bot: "Starting production of piece #1..."
3. Generate piece #1 only
4. Send piece #1 for review (approve/fix/skip)
5. Wait for user response
6. Apply fix or move to next
7. Generate piece #2 only
8. Send piece #2 for review
9. (Repeat for all pieces)

---

## 🔧 FIX LOCATION

**File:** `/home/ubuntu/.openclaw/workspace/skills/content-engine/pillar-workflow/SKILL.md`

**Section:** STEP 4 — PARALLEL CONTENT GENERATION

**Current (WRONG):**
```
## STEP 4 — PARALLEL CONTENT GENERATION

This is the core pipeline change. Do NOT generate pieces one-by-one sequentially. 
Generate ALL pieces in parallel...

For EACH piece in the production plan, immediately spawn a sub-agent:
```

**Should be (CORRECT):**
```
## STEP 4 — SEQUENTIAL CONTENT GENERATION (ONE AT A TIME)

Generate pieces ONE AT A TIME. For each piece:
1. Spawn content-producer for piece #1 only
2. Wait for completion
3. Send to user for review (approve/fix/skip)
4. Wait for user response
5. Apply feedback or move to next
6. Generate piece #2 only
7. (Repeat)

Spawn ONLY ONE subagent at a time. Wait for it to complete and deliver to user before spawning the next.
```

---

## 📋 WHAT NEEDS TO CHANGE

### Before: (Parallel - WRONG)
```
For EACH piece in production_plan:
  spawn(content-producer, piece) → ALL SPAWN AT ONCE
  
Result: 5-12 pieces ready simultaneously
```

### After: (Sequential - CORRECT)
```
For piece_n in production_plan:
  1. spawn(content-producer, piece_n)
  2. Wait for completion
  3. Send to user
  4. Wait for approval/fix/skip
  5. Apply feedback
  6. Move to next piece (repeat loop)
  
Result: Only ONE piece ready at a time
```

---

## 🎯 REQUIREMENTS

The pillar-workflow STEP 4 must:

1. ✅ Generate piece #1
2. ✅ Send piece #1 for user review
3. ✅ Wait for user response (approve/fix/skip)
4. ✅ Apply fix if requested (using reflection-agent)
5. ✅ Only THEN generate piece #2
6. ✅ Repeat for all pieces sequentially

**No parallel spawning. No status messages about pieces not yet shown. No "Limit reached" messages.**

---

## 🚀 EXPECTED UX AFTER FIX

```
Bot: "Starting production of 5 pieces...

Piece #1:
[full content]
─────────────
Reply: ✅ approved / 🔧 fix: [what] / ⏭️ next

[User responds]

Bot: "Piece #1 saved. Generating piece #2..."

Piece #2:
[full content]
─────────────
Reply: ✅ approved / 🔧 fix: [what] / ⏭️ next

[repeats for pieces 3-5]

Bot: "All 5 pieces done! Ready to push to Airtable?"
```

**Clean. One piece at a time. Wait for approval. Apply fix. Next piece.**

---

## ✅ IMPLEMENTATION STATUS

- [x] Problem identified: Parallel generation in STEP 4
- [x] Root cause: "Generate ALL pieces in parallel" logic
- [ ] Fix applied: Change to sequential generation
- [ ] Testing: Verify one piece at a time
- [ ] Deployment: Update pillar-workflow SKILL.md

---

## NOTES

This is a CRITICAL behavior change. The pillar-workflow MUST NOT spawn multiple content-producer subagents at once. It must:

1. Spawn ONE subagent
2. Wait for it to complete
3. Send to user for review
4. Wait for user response
5. Move to next ONE subagent

No batching, no parallel execution, no showing multiple pieces.

