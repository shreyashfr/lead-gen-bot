---
name: onboarding
description: >
  Onboarding flow for new Content Engine users on Telegram.
  Sends a master-doc template file, waits for the user to fill it in and
  send it back as a .txt or .md file, then builds their workspace from it.
  Ends by explaining how to use the content engine.
---

# Onboarding — New User Setup (File-Based)

New users send their filled-in master doc. You build their workspace from it.
No questionnaire. No back-and-forth. One file → full system.

---

## TONE

Warm, efficient, and clear. They're a creator — respect their time.

---

## STEP 0 — SILENT WORKSPACE SETUP (before saying anything)

Before sending any message, silently:

1. Create the user workspace directory: `{USER_WORKSPACE}`
2. Create `onboarding-state.json` with `{ "step": "awaiting_master_doc", "data": {} }`
3. Add the user to `users/registry.json` with `onboarding_complete: false`

Then send this message:

```
⚙️ Setting up your workspace...
```

Wait for file ops to complete, then send:

```
✅ Workspace ready!

Hey! 👋 Welcome to the Content Engine.

Here's what I do for you — and how it works:

---

🔍 STEP 1 — RESEARCH
Every session starts with live research. I scan Reddit and Twitter/X in your niche — pulling real posts that are getting traction right now, what questions people are asking, and what gaps your competitors haven't touched yet. Not old data. Real-time.

💡 STEP 2 — IDEAS
From that research, I generate 15 content ideas — each with a hook, format, angle, and why it'll work for your audience. You just pick the ones you want.

✍️ STEP 3 — CONTENT PRODUCTION
I write every piece in your exact voice. Not generic AI copy — calibrated to your tone, your writing rules, your stories, your opinions. LinkedIn posts, Twitter threads, X articles, Tweets, Instagram carousels. All of it.

✅ STEP 4 — APPROVAL LOOP
You review each draft. Approve it or ask for fixes. Every note you give gets remembered and improves future content automatically.

📋 STEP 5 — CONTENT QUEUE
Approved content goes straight into your content queue — ready to schedule and post.

---

Everything runs from one command:
  Pillar: [your topic]

Example:
  Pillar: why most AI engineers can't explain what they're building

That's it. Full pipeline, automated, in your voice.

---

To make all of this sound like YOU — not generic AI — I need one thing:
your Master Doc. It's a single file that becomes your content brand bible.

Instead of asking you 20 questions, I use a template you fill in once.
```

Then immediately send the template file `skills/onboarding/master-doc-template.md` as a Telegram document attachment (rename it to `master-doc-template.md` when sending), followed by this message:

```
👆 That's your Master Doc template.

Here's what to do:
1. Download the file
2. Fill it in — be specific on your story, opinions, and writing rules
3. Send it back here as a .txt or .md file

The more detail you give, the better everything will sound like you.

Take your time — send it back whenever you're ready. 🚀
```

Update `onboarding-state.json` → `step: "awaiting_master_doc"`.

---

## STEP 1 — RECEIVE MASTER DOC

When the user sends a file (`.txt` or `.md`):

1. Read the file content
2. Confirm receipt:
   ```
   📄 Got it! Building your content system now...
   ```
3. Run STEP 2 (workspace build) silently
4. Send the completion message

**If user sends a message instead of a file:**

```
I'm waiting for your Master Doc file (the template I sent earlier).

Fill it in and send it back as a .txt or .md file — then I'll build your full content system.
```

**If user sends the wrong file type (e.g. PDF, DOCX, image):**

```
I need a plain text file — .txt or .md format.

Open the template in any text editor (Notepad, VS Code, TextEdit), fill it in, save it, and send it back.
```

---

## STEP 2 — BUILD WORKSPACE FROM MASTER DOC

Do all of this silently. No messages until done.

---

### 2a. Save master-doc.md

Write the file content exactly as received (converting .txt to .md if needed) to:
`{USER_WORKSPACE}master-doc.md`

Add/update the header line:
```
*Last updated: {today} | Content Engine*
```

---

### 2b. Generate voice-memory.json

Read the master doc and intelligently extract:

- **name** — from "Name:" field
- **niche** — from "Niche:" field
- **forbidden_phrases** — from Writing Rules (look for "Never use:" or "No X" patterns), plus always include these defaults:
  ```
  "leverage", "utilize", "streamline", "optimize", "facilitate", "enhance",
  "I hope this message finds you well", "I'd be delighted to",
  "I'm reaching out because", "thought leader", "guru", "game-changer", "revolutionary"
  ```
- **style rules** — from Writing Rules section:
  - `capitalization` → "normal" unless they say lowercase
  - `contractions` → "always_use" unless they say avoid
  - `sentence_length` → "short_to_medium" unless they specify otherwise
  - `em_dashes` → "avoid" if they mention no em-dashes, else "ok"
  - `semicolons` → "avoid" by default
  - `ellipsis` → "use for natural pauses" if they mention it
- **private_topics** — from PRIVATE section (array of strings)
- **tone_guardrails** — infer from Tone + Writing Rules:
  - If they say "share experiences, not advice" → `"advice_giving": "reject — share experiences only"`
  - If they say "no bias" → `"bias": "reject — present facts, let reader conclude"`
  - Always include: `"corporate_jargon": "reject"`, `"generic_motivational": "reject"`, `"ai_detectability": "must_fail_ai_test"`

Write to `{USER_WORKSPACE}voice-memory.json`:

```json
{
  "version": "1.0",
  "last_updated": "{today}",
  "user_name": "{name}",
  "niche": "{niche}",
  "voice_rules": {
    "forbidden_phrases": [...extracted + defaults...],
    "required_style": {
      "capitalization": "{extracted}",
      "contractions": "{extracted}",
      "sentence_length": "{extracted}",
      "em_dashes": "{extracted}",
      "semicolons": "{extracted}",
      "ellipsis": "{extracted if mentioned}"
    },
    "tone_guardrails": {
      "corporate_jargon": "reject",
      "generic_motivational": "reject",
      "ai_detectability": "must_fail_ai_test",
      ...any_additional_guardrails_extracted...
    },
    "private_topics": [...extracted from PRIVATE section...]
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

### 2c. Create content-queue.md

```markdown
# Content Queue — {name}

| # | Pillar | Format | Hook | Status | Date |
|---|--------|--------|------|--------|------|
```

---

### 2d. Update users/registry.json

Set: `name`, `niche`, `platforms` (extracted from master doc), `onboarding_complete: false`, `onboarding_step: "awaiting_airtable"`, `joined: {today}`

---

### 2e. Update onboarding-state.json

```json
{ "step": "awaiting_airtable", "data": { "name": "{name}" } }
```

---

## STEP 3 — AIRTABLE SETUP

After workspace is built, ask about Airtable:

```
✅ Your content system is built, {name}!

One last thing — do you want to connect Airtable?

When you approve content, it gets pushed straight to your Airtable base — organised and ready to schedule.

Reply YES or NO.
```

---

### If NO:

Save `airtable_enabled: false` to `onboarding-state.json`.
Update registry: `onboarding_complete: true`, `onboarding_step: null`.
Skip to **STEP 4 — SEND COMPLETION MESSAGE**.

---

### If YES:

Send:

```
Great! I need two things:

1️⃣ Your Airtable Personal Access Token
   Go to airtable.com/create/tokens → create a token with data.records:write scope

2️⃣ Your Base ID
   Open your Airtable base → Help → API docs → you'll see the Base ID starting with "app..."

Send them like this:
Token: patXXXXXXXXXX
Base ID: appXXXXXXXXXX
```

On response, extract `token` and `base_id`. Then ask:

```
What's the table name where posts should go?

(Default is "Posts" — just say "default" if that works)
```

On response, extract `table_name` (use "Posts" if they say "default").

---

**Verify the connection before continuing:**

1. Test: `GET https://api.airtable.com/v0/{base_id}/{table_name}?maxRecords=1`
   - **200 OK** → table exists, proceed
   - **404** → table doesn't exist, create it (see below)
   - **401/403** → token issue, ask them to fix it:
     ```
     ⚠️ Couldn't connect. Check that:
     • Token has data.records:read + data.records:write scopes
     • Token has access to this base (Edit token → Add a base)

     Send the updated token and try again.
     ```
   - Do NOT proceed until connection is verified

2. If table doesn't exist (404), create it:
   `POST https://api.airtable.com/v0/meta/bases/{base_id}/tables`
   ```json
   {
     "name": "{table_name}",
     "fields": [
       { "name": "Content", "type": "multilineText" },
       { "name": "Format", "type": "singleLineText" },
       { "name": "Pillar", "type": "singleLineText" },
       { "name": "Status", "type": "singleLineText" },
       { "name": "Date Created", "type": "date", "options": { "dateFormat": { "name": "iso" } } }
     ]
   }
   ```

3. On success, confirm:
   ```
   ✅ Airtable connected! "{table_name}" table is ready.
   ```

**Save `{USER_WORKSPACE}airtable-config.json`:**

```json
{
  "enabled": true,
  "api_key": "{token}",
  "base_id": "{base_id}",
  "table_name": "{table_name}",
  "setup_date": "{today}"
}
```

Update registry: `onboarding_complete: true`, `onboarding_step: null`, `airtable_enabled: true`.
Update `onboarding-state.json` → `step: "complete"`.

---

## STEP 4 — SEND COMPLETION MESSAGE + PROMPT FIRST PILLAR

Send:

```
🎉 You're all set, {name}!

Here's everything that's ready:
📄 Master Doc — your brand bible
🎙️ Voice Memory — tone guardrails so everything sounds like you
📋 Content Queue — ready to fill
{if airtable: 🗃️ Airtable — connected and ready to receive approved content}

---

📋 FORMATS I PRODUCE

LP — LinkedIn Post
TH — Twitter Thread
XA — X Article (long-form)
TW — Single Tweet
CA — Instagram Carousel

---

💡 OTHER COMMANDS (anytime)

run competitive scan — see what competitors posted this week
my numbers: [metrics] — log performance, I track what works
```

Then immediately send a second message:

```
Let's run your first content session right now.

Send me a topic you want to create content around — I'll scan Reddit + Twitter/X for viral posts on it, generate 15 ideas matched to your voice, and write the ones you pick.

  Pillar: [your topic]

Example:
  Pillar: why most AI engineers can't explain what they're building

What's on your mind? 👇
```

---

## EDGE CASES

**User sends master doc but it's incomplete (missing key sections):**

Still build the workspace with what's there. Flag what's missing:
```
📄 Got your Master Doc — built your workspace!

One thing I noticed: [section] was blank. You can update your master doc anytime — just send a new version and I'll rebuild from it.
```

**User wants to update their master doc later:**

If an onboarded user sends a `.txt` or `.md` file:
- Re-read it as their new master doc
- Rebuild `master-doc.md` and `voice-memory.json`
- Confirm: "✅ Updated your Master Doc and Voice Memory."

**User asks "what is this?" or "how does it work?" before sending the file:**

Answer briefly, then redirect:
```
The Content Engine writes posts in your exact voice, based on research into what's trending in your niche. It's fully automated — one command triggers research, ideas, and written content.

To get started, I just need your Master Doc. Send back the filled-in template and we're good to go.
```
