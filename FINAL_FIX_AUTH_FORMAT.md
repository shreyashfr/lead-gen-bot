# FINAL FIX: Auth Format — api_key vs token

## 🔴 ROOT CAUSE FOUND

The SDR agent auth file had incorrect JSON format:

**WRONG (What was there):**
```json
{
  "anthropic:default": {
    "type": "token",        ❌ Should be "api_key"
    "provider": "anthropic",
    "token": "sk-ant..."    ❌ Should be "key"
  }
}
```

**CORRECT (What it should be):**
```json
{
  "anthropic:default": {
    "type": "api_key",      ✅ Correct
    "provider": "anthropic",
    "key": "sk-ant..."      ✅ Correct
  }
}
```

OpenClaw looks for the `"key"` field in `"api_key"` type profiles. The SDR agent had `"token"` field in `"token"` type, which OpenClaw couldn't find.

---

## ✅ FIX APPLIED

Fixed both agent auth files:

### SDR Agent
```
Before: type: "token", field: "token"
After:  type: "api_key", field: "key"
Status: ✅ Fixed
```

### CE Agent
```
Status: ✅ Already correct (type: "api_key", field: "key")
```

---

## 📊 VERIFICATION

### SDR Agent Auth
```json
"anthropic:default": {
  "type": "api_key",
  "provider": "anthropic",
  "key": "sk-ant-oat01-..."
}
```
✅ Now matches OpenClaw's expected format

### CE Agent Auth
```json
"anthropic:default": {
  "type": "api_key",
  "provider": "anthropic",
  "key": "sk-ant-api03-..."
}
```
✅ Correct format

---

## 🚀 EXPECTED RESULT

Now when SDR agent starts:
1. OpenClaw reads auth-profiles.json
2. Looks for anthropic:default profile ✅
3. Finds "type": "api_key" ✅
4. Extracts "key" field ✅
5. Uses API key to call Anthropic ✅

**No more "No API key found" error!**

---

## ✅ FILES FIXED

- `/home/ubuntu/.openclaw/agents/sdr/agent/auth-profiles.json` ✅
  - Backup: `auth-profiles.json.backup-2026-03-24-12-16`

- `/home/ubuntu/.openclaw/agents/ce/agent/auth-profiles.json` ✅
  - No changes needed (already correct)

---

## 🎉 READY FOR TESTING

Send message to Lead Gen bot:
- Expected: ✅ Routes to SDR agent
- Auth: ✅ Uses correct API key format
- Result: ✅ Should respond (no auth error)

