# Lead Gen Agent (formerly SDR Automation) — Setup & LinkedIn Cookies

## Status: Awaiting Clarification

You've provided new LinkedIn credentials:
- **li_at:** `AQEFAREBAAAAABysXW0AAAGdG1jsuQAAAZ0_ZXdoTQAA...` (truncated)
- **JSESSIONID:** `ajax:2689896008412439311`

But I need to understand:

1. **Where should these be stored?**
   - Is there an existing LinkedIn session file?
   - Should we create a config file?
   - Which skill needs these credentials?

2. **Which skill is LinkedIn for?**
   - Is it for a LinkedIn Scout (like Reddit Scout)?
   - Is it for Sales Nav automation?
   - Is it for lead scraping?

3. **What does "Lead Gen Agent" do?**
   - Currently, sdr-automation has: Reddit Scout, Twitter Scout, YouTube Scout, Google News Scout
   - Are you adding LinkedIn as a 5th scout?
   - Or is there a separate lead generation workflow?

---

## Current SDR Automation Structure

```
sdr-automation/
├── reddit-scout/        ← Subreddit posts
├── twitter-scout/       ← Twitter/X tweets (has session.json)
├── youtube-scout/       ← YouTube videos
├── google-news-scout/   ← Google News articles
├── x-twitter/           ← Twitter posting
└── xurl/                ← URL shortening
```

**Nothing for LinkedIn currently.**

---

## Questions Before Implementation

### Question 1: LinkedIn Scout or Lead Scraper?

**Option A: LinkedIn Scout**
- Search LinkedIn for posts/content
- Extract trending topics from LinkedIn
- Similar to Reddit Scout or Twitter Scout
- Output: Top posts, engagement metrics, content ideas

**Option B: Sales Nav Scraper**
- Search for leads (people matching criteria)
- Extract lead contact info
- Profile data, company info, etc.
- Output: Lead list with metadata

**Option C: LinkedIn Connection/Outreach Automation**
- Auto-message leads
- Track responses
- Manage outreach campaigns

**Which one do you want?**

---

### Question 2: File Structure

Where should LinkedIn session be stored?

**Suggested Structure:**
```
lead-gen-agent/
├── linkedin-scout/           ← New skill
│   ├── SKILL.md
│   ├── scripts/
│   │   └── pipeline.js
│   ├── session.json          ← Li_at + JSESSIONID
│   └── config.json           ← LinkedIn settings
├── sales-nav-leads/          ← Optional
│   ├── SKILL.md
│   └── scripts/pipeline.js
└── [other scouts...]
```

Or keep scouts separate and store LinkedIn session in a shared config?

---

### Question 3: What's the Full Workflow?

**Current (Content Engine):**
```
Pillar → Research (4 scouts) → Ideas → Production → Delivery
```

**New (Lead Gen Agent):**
Should it be:
- **Standalone:** "Search LinkedIn for X" → leads delivered?
- **Integrated:** Part of larger workflow?
- **Trigger:** Manual command or automated daily/weekly?

---

## LinkedIn Cookies Explanation

The credentials you provided are standard LinkedIn session cookies:

| Cookie | Purpose |
|--------|---------|
| **li_at** | Authentication token (long-lived) |
| **JSESSIONID** | Session ID for this specific session |

**These are:**
- ✅ Personal to your LinkedIn account
- ✅ Time-limited (expire periodically)
- ⚠️ Should be stored securely
- ⚠️ Cannot be shared across users

**Security consideration:**
- Where should these be stored?
- Should they be encrypted?
- Should users provide their own?

---

## Proposed Plan (Once Clarified)

### Step 1: Clarify Requirements
- [ ] What is Lead Gen Agent's main purpose?
- [ ] LinkedIn Scout, Sales Nav scraper, or outreach automation?
- [ ] Where should cookies be stored?
- [ ] How does it integrate with Content Engine?

### Step 2: Rename sdr-automation → lead-gen-agent
- [ ] Rename directory
- [ ] Update symlinks
- [ ] Update configs

### Step 3: Add LinkedIn Support
- [ ] Create linkedin-scout skill (or similar)
- [ ] Store session cookies securely
- [ ] Test LinkedIn authentication
- [ ] Verify data extraction works

### Step 4: Integration
- [ ] Document workflow
- [ ] Add to skill map
- [ ] Test end-to-end

---

## Security Notes

Before storing credentials:

1. **Where?**
   - Don't commit to git (add to .gitignore)
   - Use environment variables or encrypted config
   - Ensure only authorized users access

2. **How to rotate?**
   - Cookies expire → how to refresh?
   - Manual update needed?
   - Auto-refresh possible?

3. **Multiple users?**
   - Each user provides their own li_at?
   - Shared account?
   - How to isolate?

---

## Next Steps

**Please clarify:**

1. What should "Lead Gen Agent" do?
   - [ ] Search LinkedIn posts (LinkedIn Scout)
   - [ ] Scrape Sales Nav leads
   - [ ] Auto-outreach to leads
   - [ ] All of the above?

2. Where should LinkedIn session be stored?
   - [ ] Separate config file per user workspace
   - [ ] Shared encrypted config
   - [ ] Environment variables
   - [ ] Other?

3. How does it fit into the product?
   - [ ] Standalone feature?
   - [ ] Part of larger content/lead workflow?
   - [ ] Used by Content Engine or separate?

Once you clarify, I can:
- ✅ Rename sdr-automation → lead-gen-agent
- ✅ Store LinkedIn credentials securely
- ✅ Create LinkedIn Scout skill
- ✅ Test authentication
- ✅ Verify it works

