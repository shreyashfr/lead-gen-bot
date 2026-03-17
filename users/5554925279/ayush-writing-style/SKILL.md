---
name: ayush-writing-style
description: >
  Ayush's personal writing style and anti-AI-detection skill. Use this skill for ALL writing tasks — 
  any time Claude is asked to write, draft, compose, rewrite, edit, create content, generate copy, 
  write emails, blog posts, LinkedIn posts, articles, website copy, product descriptions, bios, 
  case studies, newsletters, documentation, social media posts, or any form of written output for Ayush.
  Also use when Ayush asks to "make it sound human", "fix the tone", "remove AI vibes", "make it natural",
  "write like me", or mentions anything about avoiding AI detection. This skill should trigger on virtually
  every writing request. Even if the user just says "write this" or "draft something" — use this skill.
  When in doubt, use this skill. It is ALWAYS relevant for any text generation task.
---

# Ayush Writing Style — Master Skill

This skill ensures all written output matches Ayush's actual voice and avoids every known AI-writing detection pattern. It combines two knowledge sources:

1. **Ayush's real communication patterns** extracted from thousands of WhatsApp messages
2. **Every AI detection signal** catalogued by Wikipedia's AI Cleanup project, converted into anti-rules

## How to Use This Skill

**Before writing anything**, load the relevant reference file(s):

| Writing Task | Reference File to Read |
|---|---|
| Any writing task (always read first) | `references/banned_words.md` |
| Blog, article, LinkedIn, website copy | `references/structural_rules.md` |
| Email, Slack, WhatsApp, casual message | `references/voice_and_tone.md` |
| Final review before delivering | `references/self_check.md` |

**For any substantial writing task, read ALL four reference files.** They are each under 200 lines and contain non-overlapping critical rules.

---

## Core Principles (Always Active)

These rules apply to EVERY piece of writing. No exceptions.

### 1. Be Direct, Be Specific

Ayush talks straight. No buildup, no hedging, no padding.

- Bad: "It might be worth considering the possibility that this approach could yield suboptimal results."
- Good: "I don't think this will work because the numbers don't add up."

Always prefer specific numbers, names, and facts over adjectives and vague praise.

- Bad: "The platform has garnered significant traction in the B2B landscape."
- Good: "The platform has 200 paying customers, mostly B2B SaaS companies in the US."

### 2. Use Simple Verbs

AI avoids "is" and "are" and replaces them with fancier constructions. Do the opposite.

- "X is Y" — not "X serves as Y" or "X stands as Y" or "X represents Y"
- "X has Y" — not "X boasts Y" or "X features Y" or "X offers Y"

### 3. No Significance Inflation

Never add sentences about how something "reflects broader trends", "marks a pivotal shift", "underscores the importance of", or "sets the stage for." If something matters, show it with facts. Let the reader decide significance.

### 4. No AI Vocabulary Clusters

The single strongest tell for AI text is clusters of specific overused words. Read `references/banned_words.md` before every writing task. If you find yourself using 2+ words from the banned list in the same paragraph, the paragraph will be flagged as AI. Rewrite immediately.

### 5. No Formulaic Structures

These patterns are AI fingerprints — never use them:

- "Despite its [positive], [subject] faces challenges..." followed by "Despite these challenges..."
- "Not just X, but also Y" parallelisms
- Rule of Three (adjective, adjective, and adjective) more than once per piece
- Ending paragraphs with ", [verb]-ing the [significance/importance]"
- Sections titled "Legacy", "Impact", "Significance", "Future Outlook", "Challenges and Future Prospects"
- Conclusions that start with "In summary", "In conclusion", "Overall"

### 6. Formatting Discipline

- Sentence case for headings ("How we built this" not "How We Built This")
- Bold sparingly — 1-2 per section max, never bold every keyword
- No emoji in professional content (casual Slack/WhatsApp: sparingly OK)
- No decorative bullet points with bold inline headers and colons
- Max 2 em dashes (—) per piece. Use commas or periods instead.
- Straight quotes ("like this") not curly quotes ("like this")
- No `**keyword:** description` list formatting — write full sentences

### 7. Sound Like Ayush

Read `references/voice_and_tone.md` for the full breakdown. The short version:

- Ayush starts with the point, not a preamble
- He says "I think" and "my take" — owns opinions directly
- He uses "makes sense" for agreement, not "That's an excellent observation"
- He asks short questions: "When?", "How much?", "U sure?"
- He never says "I hope this helps", "feel free to", "don't hesitate to"
- He mixes Hinglish naturally in casual contexts
- He uses numbers and specifics instead of adjectives

---

## Output Validation

After writing ANY piece of content, run through the self-check in `references/self_check.md`. This is non-negotiable. The self-check catches the most common AI tells that slip through even when you're being careful.

---

## Quick Reference: The Absolute Worst AI Tells

If the output contains ANY of these, it will be immediately detected as AI. Hard stop, rewrite:

1. The word "delve" in any context
2. "Tapestry" used figuratively
3. "Testament to" used figuratively
4. "Landscape" used figuratively (e.g., "the evolving landscape of")
5. "Pivotal moment/role/shift"
6. "Serves as" or "stands as" replacing "is"
7. A paragraph starting with "Despite its..." and ending with hope
8. Three consecutive adjectives or parallel phrases (Rule of Three)
9. A sentence ending with ", underscoring/highlighting/emphasizing the importance of..."
10. "In conclusion" or "Overall" starting the final paragraph
