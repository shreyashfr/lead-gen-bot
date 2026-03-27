# How to Get Fresh LinkedIn Cookies

**Status:** ❌ Your li_at cookie is EXPIRED or INVALID (confirmed via HTTP 403 test)

---

## Step-by-Step Guide to Get Fresh Cookies

### 1. Get Fresh LinkedIn li_at Cookie

**Why it matters:**
- li_at expires every 24 hours
- Jobs search needs this cookie
- Without it: 403 Forbidden error

**Steps:**

```
1. Open Chrome/Firefox (or any browser)
2. Go to https://www.linkedin.com
3. If not logged in → Log in with your account
   - Verify you see your profile picture in top right
   - This confirms you're logged in
4. Open Developer Tools:
   - Windows/Linux: Press F12
   - Mac: Press Cmd+Option+I
5. Go to Application tab → Cookies → linkedin.com
6. Find the cookie named "li_at"
7. Double-click on the VALUE field
8. Select all (Ctrl+A or Cmd+A)
9. Copy the entire value (Ctrl+C or Cmd+C)
10. This is your FRESH li_at cookie ✅
```

**Example value:** `AQEFAREBAAAAABzJpdkAAAGdMCNAmg...` (very long string)

---

### 2. Get Fresh LinkedIn li_a Cookie (for Sales Navigator)

**Why it matters:**
- li_a is for Sales Navigator API
- Expires every 7-30 days
- Requires Sales Navigator subscription
- Without it: 403 Forbidden error

**Steps:**

```
1. Same browser session (already logged in)
2. Go to https://www.linkedin.com/sales/search/people
3. If you don't see "Sales Navigator" interface:
   - You may not have Sales Navigator subscription
   - You can still use other 6 sources
4. If you see Sales Navigator interface:
   - Open Developer Tools (F12)
   - Go to Application tab → Cookies → linkedin.com
   - Find the cookie named "li_a"
   - Double-click on the VALUE field
   - Select all (Ctrl+A)
   - Copy the entire value (Ctrl+C)
   - This is your FRESH li_a cookie ✅
```

**Example value:** `AQJ2PTEmc2FsZXNfY2lkPTY4MDE4ODA0MiU...` (shorter than li_at)

---

### 3. Update the Configuration File

**File:** `/home/ubuntu/.openclaw/workspace/lead-gen-bot/config/sessions.json`

**How to update:**

Open the config file and replace the old values:

```json
{
  "linkedin": {
    "li_at": "PASTE_YOUR_FRESH_LI_AT_HERE",
    "JSESSIONID": "ajax:2689896008412439311"
  },
  "salesnav": {
    "li_a": "PASTE_YOUR_FRESH_LI_A_HERE",
    "JSESSIONID": "ajax:2689896008412439311"
  },
  ... rest of config
}
```

**Steps to update:**

```bash
1. Copy your fresh li_at value
2. Replace the value in config/sessions.json under linkedin.li_at
3. Copy your fresh li_a value
4. Replace the value in config/sessions.json under salesnav.li_a
5. Save the file
6. Run: node test-full-scan-v2.js
```

---

## Verification: How to Confirm Your Cookie is Fresh

**Test immediately after copying:**

Run this command to verify:

```bash
node -e "
const config = require('./config/sessions.json');
const axios = require('axios');

(async () => {
  const response = await axios.get('https://www.linkedin.com/voyager/api/me', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Cookie': \`li_at=\${config.linkedin.li_at}\`,
      'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 10000,
    validateStatus: () => true
  });
  
  if (response.status === 200) {
    console.log('✅ li_at is VALID and FRESH');
  } else if (response.status === 403) {
    console.log('❌ li_at is still invalid (403)');
  } else {
    console.log('⚠️ Status:', response.status);
  }
})();
"
```

Expected output: `✅ li_at is VALID and FRESH`

---

## Common Issues

### Issue 1: Cookie value too short
**Problem:** You copied only part of the cookie  
**Solution:** Make sure you copied the ENTIRE value (may be 400+ characters)

### Issue 2: Still getting 403 after update
**Problem:** Cookie is from different account or still expired  
**Solution:**
1. Verify you're logged into the RIGHT LinkedIn account
2. Try again with a freshly opened browser
3. Log out → Log in fresh → Copy cookie

### Issue 3: No li_a cookie found
**Problem:** You don't have Sales Navigator subscription  
**Solution:** 
- That's OK! System still works with 6 other sources
- You can skip the li_a step
- Will get 12-15 leads instead of 20

---

## Timeline: When Cookies Expire

**li_at (LinkedIn Jobs):**
- Expires: Every 24 hours
- Need to refresh: Daily if running daily

**li_a (Sales Navigator):**
- Expires: Every 7-30 days
- Need to refresh: Weekly or bi-weekly

**Glassdoor & Indeed cookies:**
- Expires: 7+ months (long-lived)
- Need to refresh: Only when getting 403 errors

---

## After You Update

Once you have fresh cookies:

```bash
# Run the full test
node test-full-scan-v2.js

# Expected result:
# ✅ 20 leads with 8-10 decision makers
# ✅ Execution time: 20-25 seconds
# ✅ Multiple sources active
```

---

## Pro Tip: Automate Cookie Refresh

To avoid manual cookie refresh, you could:
1. Use Puppeteer to login and extract cookies automatically
2. Run a scheduled job to refresh cookies daily
3. Create a browser extension that exports cookies

But for now, manual refresh every 24h for li_at is fastest ✅

---

## Summary

| Cookie | Status | Action | Expiry |
|--------|--------|--------|--------|
| **li_at** | ❌ Expired | Get fresh | 24h |
| **li_a** | ❌ Expired | Get fresh | 7-30d |
| **Glassdoor** | ✅ Valid | (none) | 7+ months |
| **Indeed** | ✅ Valid | (none) | 7+ months |

---

**Next step:** Get fresh li_at and li_a from browser, update config, re-run test! 🚀
