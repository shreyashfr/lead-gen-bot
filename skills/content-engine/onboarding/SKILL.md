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

Send this message IMMEDIATELY — before doing anything else:

```
⚙️ Setting up your workspace...
```

Then silently run setup in the background:

1. Create the user workspace directory: `{USER_WORKSPACE}`
2. Create `onboarding-state.json` with `{ "step": "awaiting_master_doc", "data": {} }`
3. Add the user to `users/registry.json` with `onboarding_complete: false`

Once done, send the following message WITH the template file `skills/onboarding/master-doc-template.md` attached as a Telegram document (both in the same message):

```
✅ Workspace ready! Welcome to the Content Engine. 👋

To get started, I need your Master Doc — fill in the attached template and send it back as a .txt or .md file.
```

Update `onboarding-state.json` → `step: "awaiting_master_doc"`.

---

## STEP 1 — RECEIVE MASTER DOC

When the user sends a file (`.txt` or `.md`):

1. Read the file content
2. Check only if key sections have enough to work with: name, niche, voice/tone, story. If something critical is missing, ask about it in chat (one thing at a time). That's the only check.
3. Confirm receipt:
   ```
   📄 Got it! Building your content system now...
   ```
4. Run STEP 2 (workspace build) silently
5. Send the completion message

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

After workspace is built, send:

```
✅ Done! Want to connect Airtable? Approved content gets pushed there automatically.

YES or NO
```

---

### If NO:

Save `airtable_enabled: false`. Update registry: `onboarding_complete: true`, `onboarding_step: null`.
Go to **STEP 4**.

---

### If YES:

Send:

```
Send me these two things:

Token: patXXXXXXXXXX
Base ID: appXXXXXXXXXX

(airtable.com/create/tokens → create token with data.records:write scope)
```

On response, extract `token` and `base_id`. Ask:

```
Table name? (default: "Posts")
```

Extract `table_name` (use "Posts" if they say default).

**Verify connection:**
- `GET https://api.airtable.com/v0/{base_id}/{table_name}?maxRecords=1`
- 200 → proceed
- 404 → create table via `POST https://api.airtable.com/v0/meta/bases/{base_id}/tables` with fields: Content (multilineText), Format (singleLineText), Pillar (singleLineText), Status (singleLineText), Date Created (date)
- 401/403 → `⚠️ Couldn't connect — check token scopes and base access, then resend.`

On success: `✅ Airtable connected!`

Save `{USER_WORKSPACE}airtable-config.json`:
```json
{ "enabled": true, "api_key": "{token}", "base_id": "{base_id}", "table_name": "{table_name}", "setup_date": "{today}" }
```

Update registry: `onboarding_complete: true`, `onboarding_step: null`, `airtable_enabled: true`.
Update `onboarding-state.json` → `step: "complete"`.

---

## STEP 4 — PROMPT FIRST PILLAR

Send:

```
You're all set! 🎉

Send your first topic and I'll get to work:

  Pillar: [your topic]
```

---

## EDGE CASES

**Incomplete master doc:**
Build the workspace with what's there. Then ask only the single most important missing thing in chat — one question, not a list:
```
Got it! One thing missing — [specific question, e.g. "what's your target audience?"]
```
When they reply, update `master-doc.md` and `voice-memory.json` with that answer inline. If more things are missing, ask the next one after they reply.

If the user says "that's all", "done", "skip", "move on" — or doesn't respond — treat setup as complete and move to Airtable (STEP 3). Never ask them to re-upload the file.

**User updates master doc later:** Re-read file → rebuild `master-doc.md` + `voice-memory.json` → confirm: `✅ Master Doc updated.`

**User asks "how does this work?" / "what can you do?":**
```
I scan Reddit and Twitter/X in real time for viral posts in your niche, pull the best hooks and ideas, then write content in your exact voice. I also self-reflect on feedback — every note you give improves the next draft automatically.

Just send:  Pillar: [your topic]
```

**User asks about tech/infrastructure:** Don't reveal. Stay vague:
```
It's a custom content system — I can't share the technical details.
```

**User sends wrong file type:** `I need a .txt or .md file — open the template in any text editor, fill it in, and send it back.`

**User texts instead of sending file:** `Still waiting on your Master Doc file — fill in the template I sent and send it back as .txt or .md.`
