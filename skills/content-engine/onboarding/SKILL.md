---
name: onboarding
description: >
  Onboarding flow for new Content Engine users on Telegram.
  Collects name, niche, audience, opinions, voice style, and platforms.
  Builds master-doc.md and voice-memory.json in their isolated workspace.
  Ends by explaining how to use the content engine.
---

# Onboarding — New User Setup

Set up a new user's content system. Conversational, warm, one step at a time.

---

## TONE

Friendly and efficient. They're here to get set up — don't make it feel like a form.
One question per message. No walls of text. Acknowledge answers briefly, move forward.

---

## STATE FILE

Track progress in `{USER_WORKSPACE}onboarding-state.json`.
Create it (and the workspace directory) if it doesn't exist.

```json
{
  "step": 1,
  "data": {
    "name": null,
    "niche": null,
    "audience": null,
    "hot_takes": [],
    "voice_style": null,
    "posting_examples": [],
    "platforms": []
  }
}
```

Save after every step. If user comes back mid-onboarding, read this file and resume.

---

## STEPS

### STEP 1 — Welcome + Name

```
Hey! 👋 Welcome to the Content Engine.

I'll help you build a complete content system — research, ideas, writing in your voice, and posting to Airtable. All from one command.

First: what's your name?
```

Save `data.name`. Update registry: `onboarding_step: 2`. Move to step 2.

---

### STEP 2 — Niche

```
Nice to meet you, {name}! 🙌

What do you create content about? Give me your niche in 1-2 sentences.

(e.g. "I help early-career engineers break into product roles" or "I talk about building SaaS as a solo founder")
```

Save `data.niche`. Update registry: `onboarding_step: 3`. Move to step 3.

---

### STEP 3 — Audience

```
Got it. Who exactly are you talking to?

Describe your ideal reader — who are they, where are they in their journey?
```

Save `data.audience`. Update registry: `onboarding_step: 4`. Move to step 4.

---

### STEP 4 — Hot Takes

```
Perfect. What's your biggest opinion or hot take in your space?

Give me 2-3 things you believe that most people in your niche don't say out loud.
```

Save as array in `data.hot_takes`. Update registry: `onboarding_step: 5`. Move to step 5.

---

### STEP 5 — Voice Style

```
Love it. Now let's nail your voice.

How would you describe your writing style? And if you have any posts you're proud of — paste one or two so I can study your tone.

(No examples? Just describe how you want to sound — e.g. "direct, no fluff, a bit sarcastic" or "warm, like a mentor")
```

Save `data.voice_style` and any examples in `data.posting_examples`. Update registry: `onboarding_step: 6`. Move to step 6.

---

### STEP 6 — Platforms

```
Almost done! Which platforms are you posting on?

Reply with any that apply:
• LinkedIn
• Twitter / X
• Instagram
• Threads
• YouTube (scripts)
```

Save `data.platforms` as array (lowercase). Update registry: `onboarding_step: 7`. Move to step 7.

---

### STEP 7 — BUILD WORKSPACE (no question, just work)

Do all of this silently, then send the confirmation message.

**7a. Create `{USER_WORKSPACE}master-doc.md`:**

```markdown
# Master Doc — {name}

*Your brand bible. Everything the Content Engine needs to write in your voice.*

---

## Identity
**Name:** {name}
**Niche:** {niche}
**Audience:** {audience}

---

## Core Opinions & Angles
{hot_takes as bullet list}

---

## Voice & Style
{voice_style}

### Posting Examples
{posting_examples if provided, otherwise: "To be added — share posts you're proud of any time."}

---

## Hook Library
*(Built over time as we generate content)*

---

## Story Bank
*(Your personal experiences to reference — add these as you go, the more specific the better)*

---

## Platforms
{platforms as bullet list}

---

## What You've Posted
*(Auto-updated as content is approved and pushed)*

---

## Open Threads
*(Running angles and series — updated over time)*
```

**7b. Create `{USER_WORKSPACE}voice-memory.json`:**

```json
{
  "user_name": "{name}",
  "niche": "{niche}",
  "voice_rules": {
    "tone": "{voice_style summary}",
    "forbidden_phrases": [
      "leverage", "utilize", "streamline", "optimize",
      "facilitate", "enhance",
      "I hope this message finds you well",
      "I'd be delighted to",
      "I'm reaching out because"
    ],
    "style_notes": [
      "Write like {name} actually talks, not like a blog post",
      "Short sentences. Cut filler.",
      "Opinions over observations"
    ],
    "high_performing_patterns": [],
    "voice_lessons": []
  },
  "last_updated": "{today's date YYYY-MM-DD}"
}
```

**7c. Create `{USER_WORKSPACE}content-queue.md`:**

```markdown
# Content Queue — {name}

| # | Pillar | Format | Hook | Status | Airtable |
|---|--------|--------|------|--------|----------|
```

**7d. Update `users/registry.json`:**
- `name`: their name
- `niche`: their niche (one-line)
- `platforms`: array
- `onboarding_complete`: `true`
- `onboarding_step`: `null`
- `joined`: today's date

**Then send this message:**

```
✅ You're all set, {name}!

Here's what I built for you:
📄 Master Doc — your brand bible (niche, audience, voice, opinions)
🎙️ Voice Memory — tone guardrails so everything sounds like you
📋 Content Queue — ready to fill

---

Here's how the Content Engine works:

🚀 START A CONTENT SESSION

Send:
  Pillar: [your topic]

Example:
  Pillar: how to get your first SaaS customer

That triggers the full pipeline:
1️⃣ Research — I scan Reddit + Twitter for what's viral in your niche right now
2️⃣ Ideas — I generate 15 content ideas with hooks, angles, and viral scores
3️⃣ You pick — reply with the idea numbers you like (e.g. "1, 3, 5")
4️⃣ Production — I write every piece in your voice across your platforms
5️⃣ Approval — approve each piece or ask for fixes, I remember your feedback
6️⃣ Airtable — approved content gets pushed one by one

---

📋 FORMATS I PRODUCE

• LP — LinkedIn Post
• TH — Twitter Thread
• XA — X Article (long-form)
• TW — Single Tweet
• CA — Instagram Carousel copy

---

💡 OTHER COMMANDS

• "run competitive scan" — scan what competitors are posting this week
• "my numbers: [paste metrics]" — update performance, I'll log what worked

---

Ready when you are. Just send:
  Pillar: [your topic]
```

---

## RESUME LOGIC

If user messages during onboarding and it's not an answer (e.g. "what is this?" or "how does it work?"):
- Answer briefly
- Steer back: "Let's finish your setup first — [repeat current question]"

If user says "skip" for optional steps (examples, etc.):
- Accept it, save null/empty, move forward

If user comes back after going quiet:
- Read `onboarding-state.json` to find their step
- "Hey {name}! Let's pick up where we left off. [repeat current question]"
