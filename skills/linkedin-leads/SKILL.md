---
name: linkedin-leads
description: >
  LinkedIn lead search using Voyager API. Two modes:
  1. Company-first (recommended): Get leads from a specific company
  2. Keyword search: Broad search with Serper fallback
---

# LinkedIn Leads

## Quick Start

### Company-First Search (Recommended)
Gets **actual employees** of a company with verified titles:

```bash
node /home/ubuntu/.openclaw/workspace/skills/linkedin-leads/scripts/company-leads.js \
  --company "Stripe" \
  --role "VP Engineering" \
  --topN 10 \
  --printChat
```

### Keyword Search (Broad)
Searches by keywords, less accurate for specific companies:

```bash
node /home/ubuntu/.openclaw/workspace/skills/linkedin-leads/scripts/pipeline.js \
  --query "AI startup founders" \
  --topN 25 \
  --printChat
```

---

## Company-First Search

**Use when**: You have a company name and want leads from that company.

**How it works**:
1. Searches LinkedIn for the company → gets company ID
2. Searches employees at that company filtered by role
3. Returns verified employees with current titles

**Parameters**:
- `--company` — company name (required)
- `--role` — title filter (e.g., "VP Engineering", "CEO")
- `--topN` — number of leads (default 10)
- `--printChat` — show progress

**Example**:
```bash
node scripts/company-leads.js --company "Nosh" --role "CEO" --topN 5
```

---

## Keyword Search

**Use when**: Broad search by role/industry, not targeting specific companies.

**Parameters**:
- `--query` — search keywords
- `--topN` — number of leads (default 25)
- `--serper-only` — skip Voyager, use Google only
- `--printChat` — show progress

**Note**: Keyword search may return people who mention keywords anywhere in their profile, not just current role.

---

## Prerequisites

- `li_at` cookie from regular LinkedIn (not Sales Navigator enterprise token)
- Optional: Serper API key for fallback

## Cookie Format
```json
{
  "cookies": [
    {
      "name": "li_at",
      "value": "...",
      "domain": ".linkedin.com"
    }
  ]
}
```

## Config Sources
1. `session.json` in skill directory
2. `/home/ubuntu/.openclaw/workspace/lead-gen-bot/config/sessions.json`
