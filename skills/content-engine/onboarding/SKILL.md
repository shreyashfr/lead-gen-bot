---
name: onboarding
description: >
  Onboarding flow for new Content Engine users on Telegram.
  Collects everything needed to build a proper master-doc and voice-memory:
  name, niche, audience, origin story, specific milestones, current project,
  core opinions, writing style/rules, platforms, what they've posted, and
  what they want kept private. Ends by explaining how to use the content engine.
---

# Onboarding — New User Setup

Set up a new user's complete content system. Conversational, warm, one question at a time.

---

## TONE

Friendly and efficient. One question per message. Acknowledge answers briefly, move forward.
This isn't a form — it's a conversation. Make them feel like they're talking to someone who genuinely gets content.

---

## STEP 0 — SILENT WORKSPACE SETUP (before saying anything)

Before sending any message to the user, do this silently in the background:

1. Create the user workspace directory: `{USER_WORKSPACE}`
2. Create the `onboarding-state.json` file with step 1 and empty data
3. Add the user to `users/registry.json` with `onboarding_complete: false`

Then — and only then — send this message:

```
⚙️ Setting up your workspace...

Building your content system in the background. This takes just a moment.
```

Wait ~2 seconds (or until file ops complete), then send:

```
✅ Workspace ready!

Hey! 👋 Welcome to the Content Engine.

I'm going to help you build a complete content system — research, ideas, posts written in your voice, and pushed straight to Airtable.

To get started, I need to learn who you are so everything actually sounds like you.

First: what's your name?
```

This way the user knows why there's a brief pause, and onboarding starts clean.

---

## STATE FILE

Track progress in `{USER_WORKSPACE}onboarding-state.json`.
Create it (and the workspace directory) if they don't exist.

```json
{
  "step": 1,
  "data": {
    "name": null,
    "niche": null,
    "positioning": null,
    "audience_description": null,
    "audience_age_range": null,
    "audience_country": null,
    "audience_fear": null,
    "audience_aspiration": null,
    "current_project": null,
    "origin_story": null,
    "specific_milestones": [],
    "hot_takes": [],
    "voice_style": null,
    "style_rules": {},
    "posting_examples": [],
    "platforms": [],
    "already_posted_topics": [],
    "private_topics": []
  }
}
```

Save after every step. If user comes back mid-onboarding, read this file and resume from their saved step.

---

## STEPS

### STEP 1 — Welcome + Name

```
Hey! 👋 Welcome to the Content Engine.

I'm going to help you build a complete content system — research, ideas, posts written in your voice, and pushed to Airtable. All from one command.

To get started, I need to learn who you are so content actually sounds like you.

First: what's your name?
```

Save `data.name`. Update registry `onboarding_step: 2`. Move to step 2.

---

### STEP 2 — Niche + Positioning

```
Nice to meet you, {name}! 🙌

What do you create content about? And give me your one-line positioning — who are you in your space?

(e.g. "I create content about AI careers. One-line: ML engineer turned founder who broke in without a degree.")
```

Save `data.niche` and `data.positioning`. Update `onboarding_step: 3`. Move to step 3.

---

### STEP 3 — Audience (Specific)

```
Got it. Now tell me exactly who you're talking to.

- Who are they? (age range, job situation, country if relevant)
- What's their biggest fear?
- What do they want most?

The more specific the better. "20-25 year old Indian CS grads scared they'll miss the AI wave" is better than "tech people."
```

Save:
- `data.audience_description` — full answer
- `data.audience_age_range` — extract if mentioned
- `data.audience_country` — extract if mentioned
- `data.audience_fear` — their core fear
- `data.audience_aspiration` — what they want

Update `onboarding_step: 4`. Move to step 4.

---

### STEP 4 — Current Project / What You're Building

```
What are you working on right now?

Company, job, side project — whatever's most relevant to your content. This gives me context so your content has a home base.

(e.g. "I'm co-founder of Second Brain Labs, a B2B SaaS for sales + marketing AI" or "I'm a senior ML engineer at [company] building recommendation systems")
```

Save `data.current_project`. Update `onboarding_step: 5`. Move to step 5.

---

### STEP 5 — Origin Story

```
This one's important. I need your story.

Where did you start? What's the hardest thing you've been through to get where you are today? Give me the raw version — the struggles, the failures, the moments that actually shaped you.

The more specific you are, the better your hooks will be. Not "I worked really hard" but "I was on 6-month notice in class 5th and my family lost everything."

Take your time with this one.
```

Save `data.origin_story` (full answer as-is). Update `onboarding_step: 6`. Move to step 6.

---

### STEP 6 — Specific Milestones & Numbers

```
Perfect. Now give me the specific numbers and moments from your journey.

Things like:
• First paycheck amount
• Specific rejection counts or durations
• Revenue numbers or milestones (even embarrassing ones)
• A moment that rewired how you think about things

The exact numbers ("₹1,700 after 2 months of follow-ups") are what make hooks land. Vague = forgettable. Specific = memorable.
```

Save as array in `data.specific_milestones`. Update `onboarding_step: 7`. Move to step 7.

---

### STEP 7 — Core Opinions & Hot Takes

```
What are your biggest opinions in your space?

Give me 3-5 things you genuinely believe that most people in your niche won't say out loud. Strong takes. The ones that might get pushback but you'd defend them.

(e.g. "Traditional ML is not dead — that narrative is a course-selling scam" or "API wrapper companies have 12 months left")
```

Save as array in `data.hot_takes`. Update `onboarding_step: 8`. Move to step 8.

---

### STEP 8 — Voice Style + Writing Rules

```
How do you write? Describe your style and give me any specific rules you follow.

For example:
• Tone (direct, casual, confrontational, warm?)
• Any formatting rules? (always lowercase? no em dashes? contractions only?)
• How long are your sentences usually?
• Anything you absolutely hate seeing in content?
```

Save `data.voice_style` (full answer). Also extract any explicit rules into `data.style_rules`:
```json
{
  "capitalization": "lowercase_default | normal | etc",
  "em_dashes": "never | ok",
  "semicolons": "never | ok",
  "contractions": "always | avoid | flexible",
  "sentence_length": "short | medium | flexible",
  "other_rules": []
}
```

Update `onboarding_step: 9`. Move to step 9.

---

### STEP 9 — Posting Examples

```
Share 1-2 posts you've written that you're proud of — or that did well.

If you don't have any yet, no problem — just describe the vibe you're going for with an example from someone else in your space.
```

Save examples (or "none" if they skip) in `data.posting_examples`. Update `onboarding_step: 10`. Move to step 10.

---

### STEP 10 — Platforms

```
Which platforms are you posting on? (reply with all that apply)

• LinkedIn
• Twitter / X
• Instagram
• Threads
• YouTube (scripts)
```

Save `data.platforms` as lowercase array. Update `onboarding_step: 11`. Move to step 11.

---

### STEP 11 — What You've Already Posted

```
Briefly — what topics or angles have you already covered in your content?

I use this to make sure we don't repeat yourself and always go somewhere new.

(e.g. "I've done a piece on traditional ML not being dead, a thread on entry-level job gaps, an Instagram carousel on AI careers")

If you're just starting out, say "nothing yet."
```

Save as array in `data.already_posted_topics`. Update `onboarding_step: 12`. Move to step 12.

---

### STEP 12 — Private Topics (What NOT to Say)

```
Is there anything about your life or work that you DON'T want mentioned publicly in content?

Personal struggles you want to keep private, specific business details, anything sensitive.

(e.g. "don't mention my 2025 mental breakdown" or "don't reference specific revenue numbers")

If everything's fair game, just say "nothing."
```

Save as array in `data.private_topics`. Update `onboarding_step: 13`. Move to step 13.

---

### STEP 13 — Airtable Setup

```
Last thing — do you want to connect Airtable so approved content gets pushed there automatically after each session?

Reply YES or NO.
```

**If NO:**
Save `data.airtable_enabled: false`. Update `onboarding_step: 14`. Move to step 14.

**If YES:**
```
Great! I need two things:

1️⃣ Your Airtable Personal Access Token
   (Go to airtable.com/create/tokens → create a token with data.records:write scope)

2️⃣ Your Base ID
   (Open your Airtable base → Help → API docs → you'll see the base ID starting with "app...")

Send them like this:
Token: patXXXXXXXXXX
Base ID: appXXXXXXXXXX
```

On response: extract `token` and `base_id` from their message.

Then ask:
```
What's the table name where posts should go?
(Default is "Posts" — just say "default" if that works)
```

On response: extract `token` and `base_id` from their message.

**IMPORTANT — Verify Airtable connection before continuing:**

1. Test token by hitting: `GET https://api.airtable.com/v0/{base_id}/Table%201?maxRecords=1`
   - If 200 → base is accessible, proceed
   - If error → tell user: "Token or Base ID seems off. Make sure:
     - Token has `data.records:read` + `data.records:write` + `schema.bases:write` scopes
     - Token has access to this base (Edit token → Add a base → select your base)
     - Send the updated token and try again"
   - Do NOT proceed until connection is verified

2. Once connection verified, check if the target table exists:
   - Try `GET https://api.airtable.com/v0/{base_id}/{table_name}?maxRecords=1`
   - If 404/error → create the table via `POST https://api.airtable.com/v0/meta/bases/{base_id}/tables` with fields: Content (multilineText), Format (singleLineText), Pillar (singleLineText), Status (singleLineText), Date Created (date)
   - Confirm: "✅ Connected! Posts table is ready."

3. Only after successful verification, save and move to step 14.

Save:
- `data.airtable_enabled: true`
- `data.airtable_token`: their token
- `data.airtable_base_id`: their base ID
- `data.airtable_table`: their table name (or "Posts" if default)

Create `{USER_WORKSPACE}airtable-config.json`:
```json
{
  "enabled": true,
  "api_key": "{token}",
  "base_id": "{base_id}",
  "table_name": "{table_name}",
  "setup_date": "{today}"
}
```

Update `onboarding_step: 14`. Move to step 14.

---

### STEP 14 — BUILD WORKSPACE (no question — just work)

Do all of this silently, then send the confirmation message.

---

**14a. Create `{USER_WORKSPACE}master-doc.md`:**

```markdown
# Master Doc — {name}
*Last updated: {today} | Content Engine*

---

## WHO YOU ARE

**Name:** {name}
**Platform:** {platforms joined}
**Niche:** {niche}

### One-line positioning
{positioning}

---

## YOUR STORY

{origin_story formatted naturally}

### Key Milestones & Moments
{specific_milestones as bullet list with exact numbers}

---

## WHAT YOU'RE BUILDING
{current_project}

---

## CORE OPINIONS & ANGLES

{hot_takes formatted as sections — one heading + explanation per take}

---

## AUDIENCE

**Who they are:** {audience_description}
**Age range:** {audience_age_range or "not specified"}
**Location:** {audience_country or "not specified"}
**Their biggest fear:** {audience_fear}
**What they want:** {audience_aspiration}

---

## VOICE & STYLE

{voice_style}

### Writing Rules
{style_rules formatted as bullet list}

### Examples
{posting_examples or "To be added"}

---

## HOOK LIBRARY
*(Built over time as we generate and test content)*

---

## STORY BANK
*(Specific moments from origin story — ready to use in hooks)*
{extract 3-5 hookable moments from origin_story + specific_milestones as ready-to-use lines}

---

## WHAT YOU'VE POSTED
{already_posted_topics formatted as list}

---

## PRIVATE — DO NOT USE
{private_topics as bullet list — content engine will never reference these}

---

## OPEN THREADS
*(Running angles and series — updated over time)*

---

## FEEDBACK LOG
*(Updated after every production session)*

| Date | Format | Pillar | What was wrong | What fixed it |
|------|--------|--------|----------------|---------------|

---

## VOICE LESSONS LEARNED
*(Patterns from feedback log — reviewed before every production session)*
```

---

**14b. Create `{USER_WORKSPACE}voice-memory.json`:**

```json
{
  "version": "1.0",
  "last_updated": "{today}",
  "user_name": "{name}",
  "niche": "{niche}",
  "voice_rules": {
    "forbidden_phrases": [
      "leverage", "utilize", "streamline", "optimize",
      "facilitate", "enhance",
      "I hope this message finds you well",
      "I'd be delighted to",
      "I'm reaching out because"
    ],
    "required_style": {
      "capitalization": "{from style_rules or 'normal'}",
      "contractions": "{from style_rules or 'always_use'}",
      "sentence_length": "{from style_rules or 'short'}",
      "em_dashes": "{from style_rules or 'avoid'}",
      "semicolons": "{from style_rules or 'avoid'}"
    },
    "tone_guardrails": {
      "corporate_jargon": "reject",
      "generic_motivational": "reject",
      "ai_detectability": "must_fail_ai_test"
    },
    "private_topics": {rules_extracted_from_private_topics}
  },
  "high_performers": {
    "hooks": [],
    "formats_by_platform": {},
    "emotional_archetypes": [],
    "viral_structures": []
  },
  "voice_lessons": [],
  "feedback_log": [],
  "reflection_log": [],
  "agent_logs": {
    "research_agent": { "last_run": null },
    "performance_reviewer": { "last_run": null }
  }
}
```

---

**14c. Create `{USER_WORKSPACE}content-queue.md`:**
```markdown
# Content Queue — {name}

| # | Pillar | Format | Hook | Status | Airtable |
|---|--------|--------|------|--------|----------|
```

**14d. Update `users/registry.json`:**
- `name`, `niche`, `platforms`, `onboarding_complete: true`, `onboarding_step: null`, `joined: today`

**Then send this message:**

```
✅ Done, {name}! Your content system is built.

Here's what I set up:
📄 Master Doc — your brand bible (story, audience, opinions, voice, hooks)
🎙️ Voice Memory — tone guardrails so everything sounds like you
📋 Content Queue — ready to fill

---

Here's how the Content Engine works:

🚀 TO START A CONTENT SESSION

Send:
  Pillar: [your topic]

Example:
  Pillar: why traditional ML still matters in 2026

That triggers the full pipeline:
1️⃣ Research — I scan Reddit + Twitter for what's viral in your niche right now
2️⃣ Ideas — 15 content ideas with hooks, angles, and viral scores
3️⃣ You pick — reply with the idea numbers you want (e.g. "1, 3, 7")
4️⃣ Production — I write every piece in your exact voice
5️⃣ Approval — you approve or ask for fixes, I remember your feedback
6️⃣ Airtable — approved content pushed one by one

---

📋 FORMATS I PRODUCE

LP — LinkedIn Post
TH — Twitter Thread
XA — X Article (long-form)
TW — Single Tweet
CA — Instagram Carousel

---

💡 OTHER COMMANDS

"run competitive scan" — what competitors posted this week
"my numbers: [metrics]" — update performance data, I track what works

---

Ready when you are. Just send:
  Pillar: [your topic]
```

---

## RESUME LOGIC

If user goes quiet mid-onboarding and comes back:
- Read `onboarding-state.json` to find their step
- "Hey {name}! Let's pick up where we left off."
- Repeat the current step's question

If user asks "what is this?" or "how does it work?" mid-onboarding:
- Answer briefly
- "Let's finish your setup first — [repeat current question]"

If user says "skip" for any step:
- Accept it, save null/empty, move forward
