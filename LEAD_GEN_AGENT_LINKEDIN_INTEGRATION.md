# Lead Gen Agent — LinkedIn Credentials Integration

## Current Status

✅ **SDR Automation exists** at `/home/ubuntu/.openclaw/workspace-sdr/`

**Two Signal Types Already Implemented:**
1. **🟢 HIRING** — LinkedIn Jobs + Sales Nav + YC Work at a Startup + Indeed
2. **🔵 RECENTLY FUNDED** — YC public API only

---

## New LinkedIn Credentials

You provided:
```
li_at = AQEFAREBAAAAABysXW0AAAGdG1jsuQAAAZ0_ZXdoTQAA...
JSESSIONID = "ajax:2689896008412439311"
```

These need to be stored for:
- **Sales Navigator** (authenticated search for decision makers)
- **LinkedIn Jobs** API (authenticated job search)
- **LinkedIn profile enrichment** (get company/title/location)

---

## Integration Steps

### Step 1: Store LinkedIn Session Securely

**Location:** `/home/ubuntu/.openclaw/workspace-sdr/auth/linkedin.json`

**File Structure:**
```json
{
  "li_at": "AQEFAREBAAAAABysXW0AAAGdG1jsuQAAAZ0_ZXdoTQAA...",
  "JSESSIONID": "ajax:2689896008412439311",
  "stored_at": "2026-03-24T11:27:00Z",
  "expires_at": "TBD",
  "status": "testing"
}
```

### Step 2: Update Scripts to Use New Credentials

**Files that use LinkedIn credentials:**
- `step1_fetch_jobs.js` — LinkedIn Jobs API
- `step2_salesnav.js` — Sales Navigator search
- `step1_indeed.js` — Indeed (may use LinkedIn for enrichment)

**What needs updating:**
- Replace old `li_at` with new one
- Replace old `JSESSIONID` with new one
- Add credential refresh logic (cookies expire)
- Add error handling for expired sessions

### Step 3: Test LinkedIn Authentication

Before deploying:
```bash
# Test Sales Nav access
DISPLAY=:99 node step2_salesnav.js --limit 5 --target 3 --start 0 --seniority "CXO"

# Test LinkedIn Jobs API
node step1_fetch_jobs.js --keywords "SDR" --location "India" --max 5

# If PASS → Integrate into hiring scan
# If FAIL → Session may need refresh
```

### Step 4: Rename SDR Automation → Lead Gen Agent

**Option A: Rename in place**
```bash
mv /home/ubuntu/.openclaw/workspace-sdr/ /home/ubuntu/.openclaw/workspace-lg/
# Update all configs + symlinks
```

**Option B: Keep SDR, add "Lead Gen Agent" as marketing name**
- SDR Automation remains the technical name
- Lead Gen Agent is the user-facing brand name

---

## Session Cookie Lifecycle

### How LinkedIn Cookies Work

| Cookie | Lifetime | Refresh |
|--------|----------|---------|
| **li_at** | 30 days | Long-lived, auto-refresh by LinkedIn |
| **JSESSIONID** | 24-30 hours | Short-lived, expires frequently |

### When Cookies Expire

Your new credentials should work for:
- ✅ Next 24 hours (JSESSIONID)
- ✅ Next 30 days (li_at)

### Refresh Strategy

When credentials expire (LinkedIn returns 401/403):
1. **Notify user** in Telegram: "LinkedIn session expired. Please provide new li_at + JSESSIONID"
2. **Pause scans** until updated
3. **Store new credentials** in `/home/ubuntu/.openclaw/workspace-sdr/auth/linkedin.json`
4. **Resume scanning**

### Automated Cookie Refresh (Future)

Could implement:
- Browser automation (Selenium/Playwright) to auto-login
- LinkedIn OAuth flow (if LinkedIn allows)
- Multi-account rotation (test with multiple profiles)

---

## Current Lead Gen Architecture

### Signal 1: HIRING (Multiple Sources)

```
User: "scan: 15 leads of VP, CXO at SaaS companies hiring for sales"
    ↓
DETECT → HIRING signal
    ↓
RUN 3 sources in parallel:
├─ SOURCE A: LinkedIn Jobs + Sales Nav (needs: li_at, JSESSIONID)
│  └─ step1_fetch_jobs.js → step2_salesnav.js
│
├─ SOURCE B: YC Work at a Startup (no auth needed)
│  └─ step1_yc_jobs.py
│
└─ SOURCE C: Indeed (optional, needs Sales Nav for enrichment)
   └─ step1_indeed.py → step2_salesnav.js
    ↓
STREAM leads to output/streaming/*.json
    ↓
Poll & send to user one by one
```

### Signal 2: RECENTLY FUNDED (YC Only)

```
User: "scan: 20 leads at recently funded AI startups"
    ↓
DETECT → RECENTLY FUNDED signal
    ↓
RUN YC public search (no auth needed):
└─ step1_yc.py
    ↓
OUTPUT: leads_yc_<timestamp>.json
    ↓
Send to user all at once
```

---

## LinkedIn Integration Points

### 1. Sales Navigator (step2_salesnav.js)

**What it does:**
- Takes LinkedIn job IDs from LinkedIn Jobs API
- Uses Sales Nav to find **decision makers** (CXO, VP, Director, Owner)
- Fetches: Name, Title, Company, LinkedIn URL, Email (if available)

**Requires:**
- `li_at` (authentication)
- `JSESSIONID` (session)
- Browser automation (Puppeteer/Playwright) or API calls

**Current implementation:**
- Uses Puppeteer with DISPLAY=:99 (headless browser)
- Needs X11/Xvfb running
- Should verify it works with new credentials

### 2. LinkedIn Jobs API (step1_fetch_jobs.js)

**What it does:**
- Search LinkedIn Jobs by keyword + location
- Returns: Job ID, Title, Company, Seniority Level, Date Posted

**Requires:**
- `li_at` (authentication)
- May need JSESSIONID

**Current implementation:**
- Should use REST API or scraping
- Needs verification with new credentials

### 3. LinkedIn Profile Enrichment (step1_indeed.py)

**What it does:**
- Indeed scraping returns company LinkedIn URLs
- Can optionally enrich with LinkedIn profile data
- Uses Sales Nav to find decision makers at those companies

**Requires:**
- `li_at` for enrichment (optional)

---

## File Plan

### Create New Auth File
```bash
# Store LinkedIn credentials
echo '{
  "li_at": "AQEFAREBAAAAABysXW0AAAGdG1jsuQAAAZ0_ZXdoTQAA...",
  "JSESSIONID": "ajax:2689896008412439311",
  "stored_at": "2026-03-24T11:27:00Z",
  "provider": "LinkedIn",
  "status": "active"
}' > /home/ubuntu/.openclaw/workspace-sdr/auth/linkedin.json
```

### Update Scripts
```bash
# scripts/step1_fetch_jobs.js
# scripts/step2_salesnav.js
# scripts/run_hiring_scan.sh
# Add: read credentials from /home/ubuntu/.openclaw/workspace-sdr/auth/linkedin.json
```

### Test Scripts
```bash
# Create test script to verify credentials work
node /home/ubuntu/.openclaw/workspace-sdr/scripts/test_linkedin_auth.js
```

---

## Testing Plan

### Phase 1: Credential Verification (Today)
- [ ] Store LinkedIn credentials
- [ ] Test Sales Nav access (5 leads)
- [ ] Test LinkedIn Jobs API (5 jobs)
- [ ] Verify no errors

### Phase 2: Integration (Today/Tomorrow)
- [ ] Update step1_fetch_jobs.js to use new credentials
- [ ] Update step2_salesnav.js to use new credentials
- [ ] Test full hiring scan (10 leads)

### Phase 3: Production (After Verification)
- [ ] Enable LinkedIn Jobs + Sales Nav in hiring scans
- [ ] Monitor for 403/401 errors (expired session)
- [ ] Plan credential refresh workflow

---

## Known Issues & Solutions

### Issue: "Sales Nav access denied" (403)
**Cause:** JSESSIONID expired (short-lived)
**Solution:** Get new JSESSIONID from LinkedIn and update auth/linkedin.json

### Issue: "LinkedIn Jobs API rate limited" (429)
**Cause:** Too many requests too fast
**Solution:** Add delays between requests (already implemented)

### Issue: "LinkedIn detected automation" (Captcha/Block)
**Cause:** Too aggressive scraping
**Solution:** Human-like pacing, rotate user agents, add delays

### Issue: "Wellfound session expired"
**Separate from LinkedIn** — stored in `session/wellfound.json`
Still need to provide new Wellfound credentials

---

## Next Steps

1. **Confirm:** Store these LinkedIn credentials now? (Y/N)
   ```bash
   # If YES:
   cat > /home/ubuntu/.openclaw/workspace-sdr/auth/linkedin.json << 'EOF'
   { ... your credentials ... }
   EOF
   ```

2. **Test:** Run test script to verify they work
   ```bash
   node /home/ubuntu/.openclaw/workspace-sdr/scripts/test_linkedin_auth.js
   ```

3. **Deploy:** Update scan scripts to use new credentials
   ```bash
   # Update step1_fetch_jobs.js + step2_salesnav.js
   ```

4. **Verify:** Run hiring scan with LinkedIn sources enabled
   ```bash
   bash /home/ubuntu/.openclaw/workspace-sdr/scripts/run_hiring_scan.sh \
     --keywords "SDR" \
     --location "India" \
     --seniority "OWNER,CXO,VP" \
     --max 10
   ```

5. **Monitor:** Track LinkedIn API usage + session expiry

---

## Summary

| Item | Status |
|------|--------|
| **Lead Gen Agent structure** | ✅ Exists (SDR Automation) |
| **Two signal types** | ✅ Hiring + Recently Funded implemented |
| **LinkedIn credential storage** | ⏳ Awaiting confirmation |
| **Sales Nav integration** | ✅ Scripts exist, needs new credentials |
| **LinkedIn Jobs integration** | ✅ Scripts exist, needs new credentials |
| **YC Jobs integration** | ✅ Working (no auth needed) |
| **Indeed integration** | ⚠️ Exists but may need testing |
| **Wellfound integration** | ⚠️ Exists but needs new credentials |

**Ready to proceed?** Confirm and I'll:
1. Store LinkedIn credentials
2. Test authentication
3. Update scanning scripts
4. Run verification scan

