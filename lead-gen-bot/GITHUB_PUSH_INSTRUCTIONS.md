# GitHub Push Instructions - Lead Gen Bot

This guide walks you through pushing the Lead Generation Bot project to a new GitHub repository.

---

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `lead-gen-bot` (or your preferred name)
3. Description: "7-Source Lead Generation Bot - Extract Decision Makers from LinkedIn, Indeed, Glassdoor, YC, Dice, WellFound, and Sales Navigator"
4. Visibility: **Public** (recommended for open source) or **Private** (if confidential)
5. **DO NOT** initialize with README (we already have one)
6. **DO NOT** add .gitignore (we already have one)
7. **DO NOT** add license (we already have MIT license)
8. Click "Create repository"

---

## Step 2: Configure Git (First Time Only)

If you haven't configured git globally:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Verify:
```bash
git config --list | grep user
```

---

## Step 3: Add GitHub Remote

```bash
cd /home/ubuntu/.openclaw/workspace/lead-gen-bot

# Replace USERNAME with your GitHub username
git remote add origin https://github.com/USERNAME/lead-gen-bot.git

# Verify
git remote -v
# Should show:
# origin  https://github.com/USERNAME/lead-gen-bot.git (fetch)
# origin  https://github.com/USERNAME/lead-gen-bot.git (push)
```

---

## Step 4: Push to GitHub

### Option A: HTTPS (Easier for first time)

```bash
# Push all commits
git push -u origin main

# Or if your branch is "master":
git push -u origin master

# If you get an auth error, create a Personal Access Token:
# 1. Go to https://github.com/settings/tokens
# 2. Click "Generate new token"
# 3. Select scopes: repo (full control)
# 4. Copy the token
# 5. Use token as password when prompted
```

### Option B: SSH (Recommended for future pushes)

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to ssh-agent
ssh-add ~/.ssh/id_ed25519

# Add public key to GitHub:
# 1. Copy: cat ~/.ssh/id_ed25519.pub
# 2. Go to https://github.com/settings/keys
# 3. Click "New SSH key"
# 4. Paste the key
# 5. Save

# Change remote to SSH
git remote set-url origin git@github.com:USERNAME/lead-gen-bot.git

# Push
git push -u origin main
```

---

## Step 5: Verify Push

Visit: https://github.com/USERNAME/lead-gen-bot

You should see:
- ✅ README.md in the home page
- ✅ All project files
- ✅ Git history (commits)
- ✅ MIT License badge

---

## Step 6: Future Commits

After the initial push, all future commits are simple:

```bash
# Make changes
git add .
git commit -m "Your commit message"

# Push
git push origin main
```

---

## Project Files Included

### Core Scripts (7 Lead Sources)
- ✅ `scripts/linkedin-jobs.js` — LinkedIn Voyager API
- ✅ `scripts/salesnav-scraper.js` — LinkedIn Sales Navigator
- ✅ `scripts/indeed-scraper.js` — Indeed jobs
- ✅ `scripts/glassdoor-scraper.js` — Glassdoor jobs
- ✅ `scripts/yc-scraper.js` — Y Combinator
- ✅ `scripts/dice-scraper.js` — Dice tech jobs
- ✅ `scripts/wellfound-serper.js` — WellFound startups

### Configuration
- ✅ `config/sessions.json` — Credentials (⚠️ GITIGNORED)
- ✅ `package.json` — Dependencies

### Testing
- ✅ `test-full-scan-v2.js` — Comprehensive test suite
- ✅ `test-all-sources.js` — Individual source tests

### Documentation
- ✅ `README.md` — Complete guide (10,000+ words)
- ✅ `docs/QUICK_START.md` — 3-minute setup
- ✅ `docs/GET_FRESH_COOKIES.md` — Cookie extraction
- ✅ `docs/PROXY_VERIFICATION_REPORT.md` — Proxy validation
- ✅ `docs/TROUBLESHOOTING_403_ERRORS.md` — Error solutions
- ✅ `docs/EXACT_COOKIES_CAUSING_ERROR.md` — Issue details
- ✅ `docs/FINAL_STATUS.md` — Status report

### Standard Files
- ✅ `LICENSE` — MIT License
- ✅ `.gitignore` — Protect sensitive files
- ✅ `GITHUB_PUSH_INSTRUCTIONS.md` — This file

---

## What's NOT Included (Protected)

⚠️ **These files are git-ignored for security:**
- `config/sessions.json` — Contains credentials
- `.env` — Environment variables
- `node_modules/` — Dependencies (install via npm)
- `*.log` — Log files

**Important:** Before sharing with others:
1. Create `config/sessions.json.example` with dummy values
2. Document how to get real credentials
3. Add to README: "⚠️ Create config/sessions.json from .example"

---

## GitHub Repository Settings (Recommended)

After pushing, configure GitHub:

1. **Settings → General**
   - Description: "7-Source Lead Generation Bot"
   - Website: (optional)
   - Topics: `lead-generation`, `web-scraping`, `linkedin`, `api`, `nodejs`
   - Make private if needed

2. **Settings → Collaborators**
   - Add team members if collaborative project

3. **Settings → Actions (if using CI/CD)**
   - Can add GitHub Actions for automated testing

4. **README badge (Optional)**

Add to top of README.md:
```markdown
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)]()
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)]()
```

---

## Create .example Files (Recommended)

For security, create template files:

### config/sessions.json.example
```json
{
  "linkedin": {
    "li_at": "YOUR_LINKEDIN_COOKIE_HERE",
    "JSESSIONID": "ajax:XXXXXX"
  },
  "salesnav": {
    "li_a": "YOUR_SALESNAV_COOKIE_HERE",
    "JSESSIONID": "ajax:XXXXXX"
  },
  "proxy": {
    "server": "http://proxy.com:port",
    "username": "username",
    "password": "password"
  },
  "serper": {
    "apiKey": "YOUR_SERPER_API_KEY"
  }
}
```

Add to git:
```bash
git add config/sessions.json.example
git commit -m "Add config template (with dummy values)"
git push
```

---

## Post-Push Checklist

- [ ] Repository created on GitHub
- [ ] All files pushed (check on GitHub.com)
- [ ] README.md displays correctly
- [ ] .gitignore is working (config/sessions.json not visible)
- [ ] LICENSE is visible
- [ ] Git history shows all commits
- [ ] Documentation is complete and readable

---

## Share Your Project

Once on GitHub:

1. **Share the link:** `https://github.com/USERNAME/lead-gen-bot`
2. **Add to portfolio:** Link in LinkedIn, resume, website
3. **Contribute:** Welcome PRs for improvements
4. **Star yourself:** Click ⭐ to bookmark

---

## Troubleshooting

### "Permission denied (publickey)"
```bash
# Use HTTPS instead:
git remote set-url origin https://github.com/USERNAME/lead-gen-bot.git
git push -u origin main
```

### "Everything up-to-date"
Your local changes haven't been committed yet:
```bash
git add .
git commit -m "Describe your changes"
git push origin main
```

### "fatal: Could not read from remote repository"
Check remote URL:
```bash
git remote -v
# Should show your GitHub URL
```

### "Branch 'main' set up to track 'origin/main'"
This is normal! Your branch is now tracking GitHub.

---

## Next Steps

After pushing to GitHub:

1. **Add CI/CD** (Optional)
   - GitHub Actions for automated testing
   - Deploy to AWS Lambda, Heroku, etc.

2. **Set up Issues**
   - Create issue templates
   - Label: bug, enhancement, documentation

3. **Collaborate**
   - Invite team members
   - Set up pull request reviews

4. **Monitor**
   - Enable GitHub Insights
   - Track contributors
   - View traffic

---

## Resources

- **GitHub Docs:** https://docs.github.com/
- **Git Commands:** https://git-scm.com/docs
- **SSH Setup:** https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- **Personal Access Token:** https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

---

**Ready to push?** Follow the steps above and your Lead Gen Bot will be on GitHub! 🚀

