---
name: ai-humanizer
description: >
  Scans a content draft for AI writing patterns and rewrites them to sound human.
  Based on documented AI writing tells (adapted from the Wikipedia AI signs field guide).
  Called by voice-guardian and content-producer before any draft is delivered to the user.
  Returns either a clean rewritten draft or a list of specific line-by-line fixes.
---

# AI Humanizer

Removes AI-ness from content drafts. Does not soften or summarize — it surgically rewrites flagged lines.

---

## HOW TO USE THIS SKILL

1. Receive a draft (from content-producer or voice-guardian)
2. Run the full checklist below — scan every line
3. Flag each violation with the line + what's wrong + the rewrite
4. Produce the final clean draft
5. Return it with a brief note on what was changed

If the draft passes all checks → return it unchanged with: `AI-HUMANIZER: ✅ Clean`

---

## THE CHECKLIST — 12 AI PATTERNS TO KILL

---

### 1. BANNED AI VOCABULARY

These words appear statistically far more in AI-generated text than human writing. Flag every instance.

**Hard ban (rewrite always):**
- `delve`, `delving` → use "look into", "explore", "dig into", or just say the thing directly
- `tapestry` (abstract use) → cut it or rewrite the whole sentence
- `landscape` (abstract use, e.g. "the evolving landscape of AI") → just say what the thing is
- `testament` / `a testament to` → cut the phrase, make the observation directly
- `underscore` / `underscores` (as a verb) → use "shows", "proves", "makes clear"
- `pivotal` → use "key", "important", or nothing
- `crucial` → use "key", "essential", or just say why it matters
- `intricate` / `intricacies` → cut or rewrite with specifics
- `meticulous` / `meticulously` → cut or say what was actually done carefully
- `vibrant` → use a specific description of what makes it good
- `foster` / `fostering` → use "build", "grow", "create"
- `bolster` / `bolstered` → use "strengthen", "support", "help"
- `garner` → use "get", "earn", "attract"
- `showcase` → use "show", "demonstrate", "highlight"
- `align with` → use "matches", "fits", "supports"
- `enhance` → use "improve", "strengthen", "make better"
- `leverage` (the verb) → use "use", "tap into"
- `utilize` → use "use"
- `streamline` → use "simplify", "cut down"
- `boasts` (meaning "has") → use "has", "includes"
- `enduring` → use "lasting" or say what's lasted
- `interplay` → say what specifically interacts with what
- `encompassing` → cut or rewrite as a list
- `highlight` (as a verb when analyzing someone else's work) → say what the person actually said

**Soft flag (flag if appearing 2+ times in the draft):**
- `Additionally` to start a sentence → use "Also", "And", or restructure
- `key` as an adjective ("a key factor") → say what makes it key, or cut
- `valuable insights` → say what the insight actually is
- `meaningful` → say what meaning it carries specifically

---

### 2. FAKE IMPORTANCE PHRASES

AI puffs up ordinary content by attaching significance statements. These are filler. Cut them all.

**Patterns to kill:**
- `stands as a [significant/powerful/important]...`
- `serves as a reminder that...`
- `represents a significant shift toward...`
- `marks a pivotal moment in the...`
- `setting the stage for...`
- `shaping the [future/landscape] of...`
- `reflecting broader trends in...`
- `symbolizing its enduring/lasting...`
- `contributing to the [rich tapestry/broader movement] of...`
- `underscores its importance/significance`
- `has long been a crucial/vital role in...`
- `indelible mark on...`
- `deeply rooted in...`

**Fix:** Delete the phrase entirely. If the sentence collapses, the observation wasn't worth making.

---

### 3. PRESENT PARTICIPLE TAIL-ONS (superficial analysis glued to real facts)

AI habitually glues analysis to the end of sentences as a dangling `-ing` phrase. This makes real facts sound overblown.

**Pattern:**
`[Real fact], [analysing/highlighting/emphasizing/underscoring/contributing to/fostering/reflecting] its [importance/role/significance/legacy]`

**Examples to catch:**
- `"He built the product in 6 months, demonstrating his commitment to innovation."` → `"He built the product in 6 months."`
- `"The post got 50k views, underscoring the power of authentic storytelling."` → `"The post got 50k views."`
- `"He left his corporate job, reflecting a broader shift in how engineers think about careers."` → `"He left his corporate job."`

**Fix:** Cut everything after the comma. The fact speaks for itself.

---

### 4. NOT X BUT Y — NEGATIVE PARALLELISMS

AI loves to appear thoughtful by "correcting" what the reader is supposedly thinking. It sounds robotic.

**Patterns:**
- `Not just X, but also Y`
- `It's not X — it's Y`
- `Not only X, but X`
- `No X, no Y, just Z`
- `This isn't about X, it's about Y`

**Fix:** Pick one thing and say it directly. Drop the fake contrast.

---

### 5. COPULA AVOIDANCE ("is/are" replacements)

AI swaps simple "is" / "are" with bloated alternatives. Makes writing sound like a press release.

**Patterns to revert:**
- `serves as [a/the]` → `is`
- `stands as [a/the]` → `is`
- `marks the [beginning/start/moment]` → `is` or say the specific event
- `represents a [shift/movement/turn]` → `is` or just say what changed
- `acts as` → `is`
- `functions as` → `is`
- `operates as` → `is`

**Fix:** Replace with "is" or a simpler verb. Or restructure to avoid both.

---

### 6. VAGUE AUTHORITY / WEASEL ATTRIBUTIONS

AI invents unnamed sources of opinion. In posts this reads as weak, preachy, or made-up.

**Patterns:**
- `Experts argue that...`
- `Observers have noted that...`
- `Industry reports suggest...`
- `Many people believe...`
- `Studies show...` (without citing one)
- `It is widely accepted that...`
- `Research indicates...` (without specifics)

**Fix:** Either name the source and what they actually said, or drop the attribution and make the claim directly as your opinion. First-person opinion beats fake consensus.

---

### 7. CHALLENGE/FUTURE FORMULA

AI ends sections with a rigid formula: `Despite [positive], [subject] faces challenges. However, [vague optimism].`

**Pattern to kill:**
- `Despite its [positive attribute], X faces several challenges including...`
- `Despite these challenges, X continues to...`
- `Future prospects include...`
- `Moving forward, X is well-positioned to...`
- `As the landscape continues to evolve...`

**Fix:** Either say the specific challenge plainly, or cut this section entirely. A real post ends on the line that earns the most. Not a summary.

---

### 8. RULE OF THREE PADDING

AI uses triple structures to appear comprehensive. In social media content it reads as bloated.

**Pattern:**
`[noun], [noun], and [noun]` or `[short phrase], [short phrase], and [short phrase]`

**Examples:**
- `"dedication, persistence, and resilience"` → pick one, make it specific
- `"He built the product, grew the team, and scaled the company"` → fine if all three are specific; kill if generic
- `"networking opportunities, learning sessions, and industry insights"` → cut to the one that actually matters

**Test:** Would cutting one of the three weaken the point? If not, cut two of them.

---

### 9. DIDACTIC DISCLAIMERS

AI adds warnings, reminders, and "important notes" as if writing a safety manual.

**Patterns:**
- `It's important to note that...`
- `It's worth remembering that...`
- `It's crucial to understand that...`
- `Keep in mind that...`
- `It should be noted that...`

**Fix:** Delete the preamble. Start with the actual statement.

---

### 10. SUMMARIZING CLOSERS

AI ends posts with summaries of what it just said. Humans don't do this in good writing.

**Patterns:**
- `In summary, ...`
- `In conclusion, ...`
- `Overall, ...`
- `To summarize, ...`
- `At the end of the day, ...` (cliché version)
- Repeating the main point in different words at the end

**Fix:** Delete the summary. The last line should be the sharpest new thing — not a recap.

---

### 11. EM DASH OVERUSE

AI uses em dashes (—) more than human writers. Especially to "punch up" clauses in a sales-like way.

**Rule:** Max 1 em dash per piece. If there are 2+, rewrite all but one as commas, colons, or shorter sentences.

**Common AI em dash patterns:**
- `[setup] — [punchy conclusion]` → split into two sentences
- `[detail] — [another detail] — [another]` → use commas or restructure

---

### 12. PROMOTIONAL / TRAVEL-BROCHURE TONE

AI defaults to advertisement language even when writing personal stories or opinions.

**Patterns:**
- `nestled in the heart of...`
- `a rich cultural heritage`
- `a diverse array of...`
- `groundbreaking`, `renowned`, `innovative` (without specifics)
- `commitment to excellence/innovation/quality`
- `a testament to [someone's] dedication`
- `world-class`
- `state-of-the-art`
- Describing a person or product the way a PR firm would

**Fix:** Strip the adjectives. Make the factual claim. Let the reader form the opinion.

---

## SCORING & DECISION

After scanning:

| Violations found | Action |
|---|---|
| 0 | Return draft with `AI-HUMANIZER: ✅ Clean` |
| 1–3 minor | Fix inline, return clean draft, note changes |
| 4–7 | Full rewrite pass — fix all violations, return with change log |
| 8+ | Draft is heavily AI-toned — rewrite from scratch using only the hook, angle, and core facts. Do not patch it. |

---

## WHAT HUMAN WRITING LOOKS LIKE INSTEAD

Human writing:
- Says the specific thing, not the inflated version of it
- Ends sentences where they end, not with analysis glued on
- Uses "is" instead of "serves as"
- States opinions directly without fake attribution
- Doesn't summarize what it just said
- Has uneven rhythm — some long sentences, some very short
- Contains at least one detail that's oddly specific and real
- Doesn't feel like it was written for the widest possible audience

**The final test:** Read the draft aloud. If it sounds like a LinkedIn ghostwriter, a corporate newsletter, or a TED talk introduction — it failed. Rewrite it.

---

## INTEGRATION POINTS

This skill is called by:
1. **voice-guardian** → runs AI-humanizer check before approval decision
2. **content-producer** → runs AI-humanizer on every draft before sending to user
3. **pillar-workflow** → can be called on any revision if user flags "sounds AI"

When called by voice-guardian, append AI-humanizer results to the validation report.
