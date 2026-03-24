# User Workspace Template

When creating a new user workspace at `users/{telegram_id}/`, create these files:

## Files to Create

### master-doc.md
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
{hot_takes}

---

## Voice & Style
{voice_style}

### Posting Examples
{examples or "To be added"}

---

## Hook Library
*(Built over time)*

---

## Story Bank
*(Your personal experiences to reference — add as you go)*

---

## Platforms
{platforms}

---

## What You've Posted
*(Auto-updated as content is approved)*

---

## Open Threads
*(Running angles and series)*
```

### voice-memory.json
```json
{
  "user_name": "{name}",
  "niche": "{niche}",
  "voice_rules": {
    "tone": "{voice_style}",
    "forbidden_phrases": [
      "leverage", "utilize", "streamline", "optimize",
      "facilitate", "enhance",
      "I hope this message finds you well",
      "I'd be delighted to",
      "I'm reaching out because"
    ],
    "style_notes": [],
    "high_performing_patterns": [],
    "voice_lessons": []
  },
  "last_updated": "{date}"
}
```

### content-queue.md
```markdown
# Content Queue — {name}

| # | Pillar | Format | Hook | Status | Airtable |
|---|--------|--------|------|--------|----------|
```

### onboarding-state.json
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

### schedule.json
```json
{
  "frequency": null,
  "day": null,
  "time_ist": null,
  "time_utc": null,
  "cron_expression": null,
  "cron_job_id": null,
  "active": false,
  "created": null
}
```
