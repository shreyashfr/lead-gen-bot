# Structural Rules — Complete Reference

This file covers every structural pattern that triggers AI detection: document structure, paragraph patterns, formatting tells, list formatting, headings, citations, and markup issues.

---

## SENTENCE-LEVEL RULES

### Use "is" and "are" Freely
AI avoids simple copulatives. Real writing uses them constantly. See banned_words.md for the full copulative avoidance section.

### Vary Sentence Length
AI writes sentences in a narrow 15-25 word band. Break this pattern:
- Throw in 4-6 word sentences. Blunt ones.
- Mix with 30-40 word sentences that carry complex thoughts with subclauses.
- The goal is rhythm, not uniformity.

### HARD RULE — No Staccato Pattern
The clearest AI tell on LinkedIn: every thought as its own isolated one-liner, all the same length, all ending abruptly.

BAD (AI):
"it can review your PRs.
it can debug your code.
it can write your tests."

GOOD (Ayush):
"it can review your PRs, build project plans and much more."

Real writing connects thoughts. Use commas, "etc…", "and much more", "but" — let ideas flow into each other. Not every sentence gets its own full stop at the same rhythm. Isolation is a detection signal. Flow is human.

### Kill the -ing Analysis Tail
Never end a sentence with a participial phrase that analyzes significance:
- BAD: "The company raised $10M in 2024, reflecting growing investor confidence in the space."
- GOOD: "The company raised $10M in 2024."
- ALSO GOOD: "The company raised $10M in 2024. Most of it came from existing investors doubling down."

### No Rule of Three (More Than Once)
AI overuses "X, Y, and Z" constructions. One instance per piece is fine. Two is pushing it. Three means rewrite.

- BAD: "The platform offers speed, reliability, and scalability. Our team brings expertise, passion, and dedication. The product combines innovation, usability, and power."
- GOOD: Use two items. Or four. Or describe things in prose without listing at all.

### Contractions Are Mandatory in Non-Technical Writing
"It's", "don't", "won't", "can't", "wouldn't" — use them. AI tends to avoid contractions in formal contexts. Their absence is a detection signal.

### No Hedging Disclaimers
Never write:
- "It's important to note that..."
- "It's worth mentioning that..."
- "It's crucial to remember..."
- "It bears noting that..."

If the thing is important, just say it. The disclaimer adds nothing.

---

## PARAGRAPH-LEVEL RULES

### No Restating Conclusions
Never end a paragraph or section by summarizing what was just said. AI does this reflexively.

- BAD: "Revenue grew 40% YoY. The team doubled. New markets opened. Overall, the company experienced significant growth across multiple dimensions."
- GOOD: Cut the last sentence. The reader just read the evidence.

### No "Despite...Challenges...Despite These Challenges" Formula
This is the #1 structural tell for AI articles. The pattern:
1. "Despite its [success/growth/impact], [subject] faces several challenges including..."
2. Generic list of challenges
3. "Despite these challenges, [subject] continues to [positive thing]"

This exact formula appears in thousands of AI-generated articles. Never use it. If you need to discuss challenges, do it naturally without the "despite" bookends.

### No Significance Build-Up Paragraphs
AI adds entire paragraphs about how something "represents a broader shift" or "contributes to the evolving landscape." Delete these. If something is significant, the facts themselves show it.

### Start Paragraphs Differently
AI starts nearly every paragraph with a topic sentence that summarizes what's coming. Break this:
- Start with a number: "Forty percent of customers churned in Q1."
- Start with a question: "So what actually changed?"
- Start with a short statement: "It didn't work."
- Start mid-thought: "Which is exactly why the team pivoted."

Don't start 3+ consecutive paragraphs with "The."

### No See Also Sections with Broad Terms
AI fills "See Also" or "Related" sections with generic category terms. If you need cross-references, make them specific and relevant.

---

## DOCUMENT-LEVEL RULES

### Banned Section Titles
Never create sections with these exact titles (they are AI fingerprints):
- "Legacy"
- "Legacy and Impact"
- "Significance"
- "Broader Impact"
- "Future Outlook"
- "Future Prospects"
- "Challenges and Future Prospects"
- "Challenges and Legacy"
- "Key Takeaways"
- "Conclusion" (in most contexts — technical docs are OK)

### Heading Style
Always sentence case: "How we built the system" not "How We Built The System"

AI defaults to Title Case for all headings. This is a known tell.

### No Submission Statements or Meta-Commentary
Never include text that describes what the document is doing:
- "In this article, we will explore..."
- "This section discusses..."
- "The following analysis examines..."
- "Below is a detailed overview..."

Just present the content. Don't narrate the structure.

---

## FORMATTING TELLS TO AVOID

### Bold Overuse
AI bolds every keyword and concept name, inherited from readmes, slide decks, and listicles.

**Rule:** Max 1-2 bold items per section. Bold only things that are genuinely critical. Never bold:
- Every proper noun
- Every technical term
- Every list item header
- Words for emphasis in the middle of sentences (use italics sparingly, or restructure)

### The Inline-Header Vertical List
This AI list format is a major tell:

```
- **Scalability:** Our system handles 10,000 concurrent users.
- **Reliability:** 99.9% uptime guaranteed.  
- **Security:** SOC2 compliant with end-to-end encryption.
```

**Fix:** Write it as prose: "The system handles 10,000 concurrent users, has 99.9% uptime, and is SOC2 compliant with end-to-end encryption."

Or if you must list, use plain bullets without bold headers:
```
- Handles 10,000 concurrent users
- 99.9% uptime
- SOC2 compliant, end-to-end encryption
```

### Em Dash Overuse
AI uses em dashes (—) far more than humans do, especially in a "punchy" sales-writing way.

**Rule:** Max 2 em dashes per entire piece. Use commas, colons, parentheses, or periods instead. This is especially important in emails, LinkedIn posts, and discussion comments where AI em dash usage is most flagged.

### Curly Quotes
ChatGPT and DeepSeek use curly quotes ("..." and '...'). Always use straight quotes ("..." and '...').

### Emoji in Professional Content
AI decorates headings and bullet points with emoji. Never do this in articles, blogs, emails, or website copy. In casual Slack/WhatsApp: use sparingly and purposefully (Ayush uses 💀 for disbelief, 😂 for humor, 👀 for curiosity — never decorative).

### Unnecessary Tables
AI creates small tables that should be prose. Only use tables when:
- You have 4+ rows of comparable data
- The data genuinely needs side-by-side comparison
- A sentence would be confusing

Never create a 2-3 row table to present simple info.

---

## CITATION & REFERENCE TELLS

### Over-Attribution in Body Text
AI painstakingly attributes every fact in the body text, even trivial ones:
- BAD: "According to the company's official website, the firm was founded in 2019."
- GOOD: "The firm was founded in 2019."

Reserve in-text attribution for controversial claims, opinions, or contested facts.

### Vague Authority Claims
Never attribute to unnamed experts:
- "Experts argue..."
- "Industry reports suggest..."
- "Observers have noted..."
- "Several publications..."

Name the source or drop the attribution.

### Knowledge-Cutoff Disclaimers
Never write: "As of my last update...", "While specific details are limited...", "Based on available information...", "Not widely documented..."

These are literal AI chatbot artifacts. If you don't know something, skip it or say "I couldn't find info on this."

### Placeholder Text
Never leave template-style placeholders: "[insert name]", "[add date]", "[describe X]". Either fill them in or mark them clearly as TODO for Ayush to complete.

---

## MARKDOWN vs WIKITEXT (for Wikipedia/wiki contexts)

If writing for any wiki platform:
- Use wikitext markup, not Markdown
- `==Heading==` not `## Heading`
- `'''bold'''` not `**bold**`
- `''italic''` not `*italic*`
- `[[link]]` not `[link](url)`

AI defaults to Markdown because that's what its training/prompts use. Using Markdown on MediaWiki platforms is a major AI tell.

---

## COMMUNICATION ARTIFACTS TO NEVER INCLUDE

These are chatbot-to-user artifacts that sometimes get pasted into content:

- "I hope this helps!"
- "Would you like me to elaborate?"
- "Certainly! Here's..."
- "Of course!"
- "Let me know if you need anything else"
- "Here is a comprehensive overview of..."
- "Feel free to reach out"
- Subject lines like "Subject: Request for..."
- Text meant for form fields pasted into body content
- "As an AI language model..."

If any of these appear in the output, delete them immediately.

---

## ELEGANT VARIATION TRAP

AI has a repetition penalty that makes it avoid reusing words. This causes it to cycle through synonyms unnecessarily:

- First mention: "the company"
- Second: "the firm"  
- Third: "the organization"
- Fourth: "the enterprise"

**Rule:** It's fine to repeat "the company" or use a pronoun. Don't cycle through synonyms just to avoid repetition. Real writers repeat words. That's normal.
