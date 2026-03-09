---
name: onboarding
description: >
  Onboarding flow for new Content Engine users. Collects name, niche, audience,
  opinions, voice style, platforms, and scheduling preferences. Builds master-doc.md
  and voice-memory.json for their isolated workspace. Ends by setting up their
  content schedule via user-scheduler.
---

# Onboarding — New User Setup

Welcome a new user and set up their complete content engine. This is a conversational flow — warm, clear, one step at a time.

---

## TONE

Be warm but efficient. This person is excited to set up their content system. Don't make it feel like a form. Ask naturally, acknowledge their answers briefly, move forward.

Keep each message focused. One question at a time. No walls of text.

---

## STATE MACHINE

Track state in `{USER_WORKSPACE}onboarding-state.json`. Create the file and the workspace directory if they don't exist.

State file format:
```json
{
  "step": 1,
  "data": {
    "name": null,
    "niche": null,
    "audience": null,
    "hot_takes": [],
    "voice_style": null,
    "platforms": [],
    "posting_examples": []
  }
}
```

---

## STEPS

### STEP 1 — Welcome + Name
**Send:**
```
Hey! 👋 Welcome to the Content Engine.

I'm going to help you build a full content system that generates ideas, writes in your voice, and handles your weekly content pipeline — all on autopilot.

First things first — what's your name?
```

On response: save `data.name`. Move to step 2.

---

### STEP 2 — Niche
**Send:**
```
Nice to meet you, {name}! 🙌

What do you create content about? Give me your niche in 1-2 sentences.
(e.g. "I help early-career software engineers land top tech jobs" or "I talk about building SaaS products as a solo founder")
```

On response: save `data.niche`. Move to step 3.

---

### STEP 3 — Audience
**Send:**
```
Got it. Who exactly are you talking to? Describe your ideal reader/follower.
(e.g. "Fresh CS grads who want to break into FAANG" or "Indie hackers doing $0-$10k MRR")
```

On response: save `data.audience`. Move to step 4.

---

### STEP 4 — Hot Takes / Core Opinions
**Send:**
```
Love it. Now — what's your biggest opinion or hot take in your space?

Something you believe that most people in your niche *don't* say publicly, or something you'd push back on.

Give me 2-3 of your strongest takes.
```

On response: save as array in `data.hot_takes`. Move to step 5.

---

### STEP 5 — Voice Style
**Send:**
```
Perfect. Now let's nail your voice.

How would you describe your writing style? And if you have any posts you're proud of — paste one or two here so I can study your tone.

(If you don't have examples yet, just describe how you want to sound — e.g. "direct, no fluff, slightly sarcastic" or "warm and encouraging, like a mentor")
```

On response: save `data.voice_style` and any examples in `data.posting_examples`. Move to step 6.

---

### STEP 6 — Platforms
**Send:**
```
Almost done with setup! Which platforms are you posting on?

Reply with any/all that apply:
- LinkedIn
- Twitter / X
- Instagram
- Threads
- YouTube (scripts)
```

On response: save `data.platforms` as array. Move to step 7.

---

### STEP 7 — Build Master Doc + Voice Memory

Now BUILD their workspace files. Do NOT ask another question yet — do the work silently then confirm.

**7a. Create `{USER_WORKSPACE}master-doc.md`:**

Use the template below, filling in everything from the onboarding data:

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
{hot_takes formatted as bullet list}

---

## Voice & Style
{voice_style}

### Posting Examples
{posting_examples if provided, or "To be added — share posts you're proud of"}

---

## Hook Library
*(Built over time as we generate content)*

---

## Story Bank
*(Your personal experiences, failures, wins to reference in content)*
*(Add these over time — the more specific, the better)*

---

## Platforms
{platforms as list with formats they use}

---

## What You've Posted
*(Updated automatically as content is approved and pushed)*

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
      "leverage",
      "utilize",
      "streamline",
      "optimize",
      "facilitate",
      "enhance",
      "I hope this message finds you well",
      "I'd be delighted to",
      "I'm reaching out because"
    ],
    "style_notes": [
      "Write like {name} talks, not like a corporate blog",
      "Short sentences. No filler.",
      "Opinions over observations"
    ],
    "high_performing_patterns": [],
    "voice_lessons": []
  },
  "last_updated": "{today's date}"
}
```

**7c. Create other workspace files:**
- `{USER_WORKSPACE}content-queue.md` → empty with header `# Content Queue — {name}`
- `{USER_WORKSPACE}competitor-list.md` → empty with prompt to fill later

**7d. Update registry.json** — set `onboarding_complete: false`, `onboarding_step: 8` (scheduling still pending)

**Send:**
```
✅ Your content system is set up, {name}!

Here's what I built:
📄 Master Doc — your brand bible with your niche, audience, and voice
🎙️ Voice Memory — your tone guardrails so content always sounds like you
📋 Content Queue — ready to fill with approved posts

One last thing: let's set up your content schedule.
```

Move to step 8.

---

### STEP 8 — Scheduling: Frequency
**Send:**
```
How often do you want to generate content?

1️⃣ Weekly — one big session per week
2️⃣ Daily — quick session each day
```

On response: save `schedule.frequency`. Move to step 9a or 9b.

---

### STEP 9a — Weekly: Day + Time
**Send:**
```
Which day works best for your content session?
(e.g. Sunday, Monday, Saturday)

And what time? (I'll message you in IST — Indian Standard Time)
```

On response: save `schedule.day` and `schedule.time_ist`. Move to step 10.

### STEP 9b — Daily: Time
**Send:**
```
What time each day should I send your content reminder?
(Tell me in IST — e.g. "9am", "7pm")
```

On response: save `schedule.time_ist`. Move to step 10.

---

### STEP 10 — Create Cron Job + Finish

Call the **user-scheduler** skill with the collected schedule data to create their cron job.

Then update registry.json:
- `onboarding_complete: true`
- `onboarding_step: null`
- Full `schedule` object filled in

**Send:**
```
🎉 You're all set, {name}!

Here's your content engine summary:

📌 Niche: {niche}
🎯 Audience: {audience}
📅 Content schedule: {frequency} on {day/time IST}
📲 Platforms: {platforms}

When your reminder fires, just reply with:
  Pillar: [your topic]

And I'll run the full pipeline — research → ideas → you pick → I write → Airtable.

You can also run it anytime manually. Just send:
  Pillar: [topic]

See you on {next scheduled day}! 🚀
```

Onboarding complete. Set `onboarding_complete: true` in registry.

---

## ERROR HANDLING

If a user sends something unexpected mid-onboarding (like "what is this?" or "how does this work?"):
- Answer briefly
- Gently steer back: "Let's finish your setup first — [repeat current question]"

If a user says "skip" for any optional step (examples, etc.):
- Accept it, save null, move forward

If a user goes quiet and comes back later:
- Read their `onboarding-state.json` to resume from where they left off
- "Hey {name}! Let's pick up where we left off..."
