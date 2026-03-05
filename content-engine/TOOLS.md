# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

---

## Airtable — Content Calendar

- **Base ID:** apprDKHi7GVzcXuN3
- **Table:** Posts
- **API Token:** patZ5zuyvWZQ53Q1v.9be8e95f264e0c9de9b902a7e09235f9d289b3ea71c63ef8e318724cbc5f1e27
- **API endpoint:** https://api.airtable.com/v0/apprDKHi7GVzcXuN3/Posts

### Push a record (approved content)
```bash
curl -s "https://api.airtable.com/v0/apprDKHi7GVzcXuN3/Posts" \
  -X POST \
  -H "Authorization: Bearer patZ5zuyvWZQ53Q1v.9be8e95f264e0c9de9b902a7e09235f9d289b3ea71c63ef8e318724cbc5f1e27" \
  -H "Content-Type: application/json" \
  -d '{"records":[{"fields":{"Title":"...","Pillar":"...","Platform":"...","Content":"...","Hook":"...","Status":"Draft","Week":"YYYY-MM-DD"}}]}'
```
