*Last updated: 2026-03-22 | Content Engine*

# Master Doc — Ayan
*Reverse-engineered from conversations. Review, correct, and fill gaps before sending to the Content Engine bot.*

---

## WHO YOU ARE

**Name:** Ayan
**Platforms:** LinkedIn *(primary — where your audience of builders and founders lives)*
**Niche:** Agentic AI Engineering, GenAI system design, AI for Indian SMBs

### One-line positioning
Builder shipping AI products for Indian businesses — not writing about AI from the sidelines, but building the actual thing and sharing what's real.

---

## YOUR STORY

*[This section needs your direct input — I can infer the shape but not the raw specifics. Here's a starter based on what I know, edit heavily:]*

I'm not from an IIT or a FAANG background. I learned ML and GenAI the hard way — by building things that broke, reading papers I didn't fully understand at first, and iterating. At some point I realized that most "AI for Indian businesses" solutions were either too expensive, too generic, or just didn't account for how Indian SMBs actually operate — WhatsApp conversations, Instagram DMs, catalog questions, regional language expectations.

So I started building AI Employee: an AI-powered customer service agent specifically for Indian SMBs. The kind of thing that lets a D2C brand owner in Tiruppur actually sleep on a Sunday instead of manually replying to "Is this available in blue?"

I've gone deep on the technical side — AWS infrastructure, real-time WebSocket messaging, Shopify integration, multi-agent orchestration, memory layers. And I'm simultaneously thinking about where the white space is: reading 2025 research papers, mapping the limitations to startup opportunities, asking "what hasn't been built yet?"

### Key Milestones & Moments
- Started building AI Employee targeting Indian SMBs handling Instagram DMs, WhatsApp, and website chat
- Built a Shopify chatbot prototype with Python, OpenAI API, Shopify's Storefront MCP, and a DynamoDB caching layer
- Designed real-time messaging architecture using AWS (API Gateway WebSocket, Lambda, SQS, DynamoDB) to replace polling
- Set up full AWS infrastructure for AI Employee including budget monitoring
- Mapped agentic AI research paper limitations to startup opportunities (memory layers, Agentic RAG, multi-agent orchestration)
- Explored whether to build vertical memory as a standalone product vs. embedding it as a moat inside AI Employee — chose the latter
- *[Add: when you started, any pivots, any early customers or conversations with SMBs, a specific failure moment, etc.]*

---

## WHAT YOU'RE BUILDING

**AI Employee** — an AI-powered customer service automation product for Indian SMBs.

Core channels: Instagram DMs, WhatsApp messages, website chat.
Core use case: Respond to customer inquiries instantly, 24/7, without a human operator. Handle product questions, order status, availability, delivery, FAQs.

Current technical differentiation being built:
- Shopify integration (product catalog awareness, cart, checkout)
- Real-time response delivery (WebSocket, not polling)
- Memory layer tuned for SMB customer service context (order history, complaint patterns, catalog context)

Target customer: Indian D2C brands, retail SMBs, service businesses — the kind of owner who loses ₹15,000/month in missed messages and spends 4+ hours/day on manual replies.

**PRIVATE:** *(move sensitive roadmap items below to the PRIVATE section)*

---

## CORE OPINIONS & ANGLES

### Vertical beats horizontal — always
Everyone is building generic AI tools. The real opportunity is going deep on a specific context. A memory system built for Indian SMB customer service will always outperform Mem0 for that use case — because Mem0 is a building block, not a solution. Specificity is the moat.

### Research papers are a startup idea map
The limitations sections of 2025 AI research papers are more valuable than any VC blog post about "the future of AI." The gaps researchers can't close are the gaps founders can fill — if they know the technical terrain. Most founders don't read papers. That's an advantage.

### Execution > ideation, but system design > both
Anyone can have a startup idea. Fewer people can actually build the thing. But the real leverage is in how you design the system — the architecture decisions you make at the start compound over time. Bad system design kills products that have great ideas and great execution.

### Indian SMBs don't need watered-down Western products
Wati, Intercom, and Zendesk are not built for a saree retailer in Surat who gets 200 WhatsApp messages a day. The UX, the pricing, the integrations, the language support — none of it maps. If you're building AI for Indian businesses, you have to start from their reality, not a translated version of a Silicon Valley product.

### Build memory as a moat, not a product
Don't start a standalone memory startup — Mem0 already has $24M and AWS distribution. Build vertical memory deeply into your product for a specific domain. That's defensible. That's where the competition isn't.

### Agents fail because nobody evaluates them
A 95% failure rate for bespoke AI systems stuck in pilot stage is a tooling problem, not a model problem. Companies don't know how to measure whether their agents are working. Agent evaluation and QA is an unsolved problem disguised as a deployment problem.

---

## AUDIENCE

**Who they are:** ML engineers, GenAI builders, founders exploring AI applications — people who are either building AI products themselves or evaluating whether to. Also: Indian startup operators who want to understand what AI can actually do for their business (not the hype version).
**Age range:** 22–38
**Location:** India (primarily), with some global reach in technical circles
**Their biggest fear:** Building something that doesn't matter. Spending 6 months on a product nobody pays for. Or — for the operators — getting left behind while competitors automate and they don't.
**What they want:** Real signal from someone who's actually in the trenches. Not another "10 prompts to use ChatGPT better" post. Show me the architecture decision. Show me the tradeoff. Show me what didn't work.

---

## VOICE & STYLE

Direct. Technical without being academic. Opinionated without being arrogant. You write like someone who's spent time in the code and also spent time thinking about the business — and can move fluently between both.

You don't hedge unnecessarily. You don't say "in my opinion" when you actually believe something. You use specific numbers and concrete examples instead of vague claims.

### Writing Rules
- No em-dashes
- Short to medium sentences. No sprawling paragraphs.
- State opinions as facts, not as "I think" or "it seems"
- Use specific numbers wherever possible — ₹15,000/month, 4 hours/day, 95% failure rate
- No: leverage, utilize, streamline, optimize, facilitate, enhance, delve
- Technical claims need specifics — name the tool, the architecture, the tradeoff
- End LinkedIn posts with one punchy line, not "hope this was helpful"
- Never start a post with "I'm excited to share..."
- Link in first comment on LinkedIn, not in the post body

### Tone
Direct, grounded, builder-to-builder. Not a professor. Not a hype machine. Someone who's figured something out and is sharing it straight.

### Examples
*[Paste 1–2 posts you're proud of here, or describe them. I don't have examples from your actual writing — this is where your own voice needs to come in.]*

---

## WHAT YOU'VE POSTED

*[Fill this in — topics you've already covered so the Content Engine doesn't repeat them. Some likely candidates based on our work:]*
- AI Employee product overview / what it does for Indian SMBs
- Shopify chatbot integration approach
- Real-time vs. polling architecture for AI response delivery
- *[Add anything you've actually posted]*

If you're starting fresh: write "nothing yet."

---

## TAGGING STRATEGY

- Tag Anthropic on posts about Claude API, agentic AI, or model behavior
- Tag relevant Indian startup/VC accounts when discussing Indian SMB market
- Tag researchers or labs when referencing specific papers
- *[Add specific founders, researchers, or companies you want to build relationships with]*

---

## PRIVATE — DO NOT USE

- Exact revenue numbers or ARR figures for AI Employee
- Specific customer names without their consent
- Confidential details about technical architecture that would be premature to share
- *[Add anything specific you don't want in public content — pivots, failures you're not ready to share, sensitive business data]*
