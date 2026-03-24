# Banned Words & Phrases — Complete Reference

This file lists every word, phrase, and pattern known to trigger AI detection. Organized by severity.

---

## HARD BAN — Never Use These

These words are statistically proven to be overused by LLMs. Multiple academic studies confirm them. Using 2+ in the same paragraph is one of the strongest AI detection signals.

### Single Words

| Banned Word | Use Instead |
|---|---|
| delve / delve into | explore, look at, dig into, examine |
| tapestry (figurative) | mix, combination, range |
| testament (figurative) | proof, evidence, sign, or drop it |
| landscape (figurative) | space, field, area, world, or drop it |
| pivotal | important, big, major, or drop it |
| crucial | important, critical (sparingly), or restructure |
| intricate / intricacies | complex, detailed, or be specific |
| meticulous / meticulously | careful, detailed, thorough |
| underscore (as verb) | shows, reveals, confirms, proves |
| vibrant | active, lively, busy, energetic |
| foster / fostering | build, grow, encourage, create |
| garner / garnered | get, earn, attract, win, pull in |
| bolster / bolstered | help, support, boost, strengthen |
| interplay | connection, relationship, dynamic |
| showcase / showcasing | show, display, demonstrate |
| enduring (figurative) | lasting, long-running, or drop it |
| nestled | located, situated, in, based in |
| groundbreaking | new, first, original — or say what's actually new |
| renowned | well-known, popular, famous |
| encompassing | covering, including |
| indelible | lasting, permanent, or be specific |
| profound | deep, significant, serious, big |
| comprehensive | full, complete, thorough, detailed |
| multifaceted | complex, varied |
| nuanced | detailed, subtle, layered |
| discourse | conversation, discussion, debate |
| paradigm | model, approach, way of thinking |
| synergy | combined effect, working together |
| leverage (as verb) | use, take advantage of, build on |
| spearhead | lead, start, drive, launch |
| realm | area, field, space, world |

### Phrases — Hard Ban

| Banned Phrase | Use Instead |
|---|---|
| serves as / stands as | is |
| boasts a | has |
| in the heart of | in, in central |
| diverse array of | range of, mix of |
| setting the stage for | leading to, before |
| marking/shaping the | changing, starting |
| key turning point | turning point (drop "key") |
| evolving landscape | (delete the whole phrase) |
| focal point | focus, center |
| deeply rooted | (be specific about roots) |
| a testament to | shows, proves |
| indelible mark | (say what the impact actually was) |
| rich tapestry | (describe the actual mix) |
| is a reminder | shows, proves |
| a vital/significant/crucial/pivotal role | an important role (or be specific) |
| reflects broader | (delete — let reader draw conclusions) |
| contributing to the | helping, adding to |
| symbolizing its ongoing | (delete — say what it actually does) |
| represents a shift | changed, moved toward |
| in today's [field] landscape | now, currently, these days |
| at the forefront of | leading, ahead in |
| commitment to excellence | (delete — say what they actually do well) |
| passion for | interest in, focus on |
| a beacon of | (just describe the thing) |
| it's worth noting that | (just state the thing) |

---

## ERA-SPECIFIC AI VOCABULARY

Different AI models overuse different word clusters. Knowing the era helps detect which model was used.

### 2023 to mid-2024 (GPT-4 era)
Additionally, boasts, bolstered, crucial, delve, emphasizing, enduring, garner, intricate/intricacies, interplay, key, landscape, meticulous/meticulously, pivotal, underscore, tapestry, testament, valuable, vibrant

### Mid-2024 to mid-2025 (GPT-4o era)
align with, bolstered, crucial, emphasizing, enhance, enduring, fostering, highlighting, pivotal, showcasing, underscore, vibrant

### Mid-2025+ (GPT-5 era)
emphasizing, enhance, highlighting, showcasing + excessive attribution and notability claims

**Rule:** If the output contains 3+ words from any single era cluster, it will be flagged. Rewrite.

---

## CONTEXTUAL BAN — Use Only When Genuinely Needed

These are OK in narrow contexts but become AI tells when clustered or used as filler.

| Word | When It's OK | When It's Banned |
|---|---|---|
| Additionally | Mid-paragraph genuine addition | Starting a sentence, ever |
| enhance | Literal product improvement | Generic "enhance the experience" |
| align with | Specific business strategy | "aligns with broader trends" |
| highlighting | Someone literally highlighted | "highlighting the importance" |
| emphasizing | Someone literally emphasized | "emphasizing the significance" |
| key (adjective) | "key metric", "key person" | "key turning point in the evolving..." |
| valuable | Literal pricing/value context | "valuable insights" |
| innovative | Describing a specific new thing | Generic descriptor |
| robust | Technical systems context | "robust framework for..." |
| seamless | Describing smooth integration | Generic positive modifier |
| dynamic | Physics/technical context | "dynamic community" |
| holistic | Medical/specific methodology | "holistic approach to..." |

---

## PHRASE PATTERNS TO KILL

These aren't about individual words but about structural patterns that signal AI authorship.

### The Significance Inflation Pattern
Any sentence that adds analysis about importance after stating a fact:

- "X was founded in 2019, **marking a pivotal moment in** the industry."
- "The team grew to 50 people, **underscoring the company's commitment to** growth."
- "Revenue hit $1M, **reflecting broader trends in** the SaaS space."

**Fix:** Delete everything after the comma. The fact speaks for itself.

### The -ing Tail Pattern
Sentences ending with a present participle phrase that analyzes significance:

- "...contributing to the region's economic development."
- "...fostering a sense of community among residents."
- "...showcasing the transformative potential of AI."

**Fix:** Either delete the -ing clause or make it a new sentence with specific detail.

### The Vague Attribution Pattern
Attributing claims to unnamed authorities:

- "Experts argue that..."
- "Industry reports suggest..."
- "Observers have noted..."
- "Several publications have cited..."

**Fix:** Name the source specifically or drop the attribution. "A 2024 McKinsey report found..." is fine. "Industry reports suggest..." is not.

### The Overgenerous Coverage Pattern
Claiming more coverage than exists:

- "Featured in TechCrunch, Forbes, Wired, and other leading publications"
- "Her work has been recognized by several major outlets"
- "Multiple reviewers have praised..."

**Fix:** Only mention sources you can actually cite. Don't imply a list is non-exhaustive unless you have evidence of more.

### The Social Media Presence Pattern
Never write: "maintains an active social media presence" or variations. This exact phrasing is an AI fingerprint. Either say something specific about their social media or don't mention it.

---

## COPULATIVE AVOIDANCE — THE HIDDEN TELL

Academic research shows a 10%+ decrease in "is" and "are" usage in AI-written text. AI replaces these with fancier verbs.

**AI does this:**
- "Gallery 825 **serves as** LAAA's exhibition space" → should be "Gallery 825 **is** LAAA's exhibition space"
- "The platform **features** four separate spaces" → should be "The platform **has** four separate spaces"
- "He **holds the distinction of being** the first" → should be "He **is** the first"
- "She **ventured into politics as** a candidate" → should be "She **was** a candidate"

**Rule:** Use "is", "are", "was", "were", "has", "have" freely and frequently. They are the most human verbs.
