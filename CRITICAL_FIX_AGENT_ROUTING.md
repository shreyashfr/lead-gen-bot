# CRITICAL FIX: Agent Routing — Registered Agent IDs

## 🔴 PROBLEM

SDR Agent was still failing with:
```
No API key found for provider "anthropic"
Auth store: /home/ubuntu/.openclaw/agents/sdr/agent/auth-profiles.json
```

Root cause: Dispatcher was routing to wrong agent IDs:
- ❌ `agentId="content-engine-agent"` (doesn't exist in OpenClaw registry)
- ❌ `agentId="sdr-automation-agent"` (doesn't exist in OpenClaw registry)

---

## 🟢 SOLUTION

OpenClaw has these agents registered in `openclaw.json`:
```json
{
  "id": "ce",
  "workspace": "/home/ubuntu/.openclaw/workspace-ce",
  "agentDir": "/home/ubuntu/.openclaw/agents/ce/agent"
}

{
  "id": "sdr",
  "workspace": "/home/ubuntu/.openclaw/workspace-sdr",
  "agentDir": "/home/ubuntu/.openclaw/agents/sdr/agent"
}
```

**The dispatcher must use these REGISTERED agent IDs:**
- ✅ `agentId="ce"` (Content Engine)
- ✅ `agentId="sdr"` (SDR Automation)

---

## ✅ FIX APPLIED

Modified dispatcher routing logic:

**BEFORE (Wrong):**
```
sessions_send(
  agentId="content-engine-agent",  ❌ Wrong ID
  ...
)
```

**AFTER (Correct):**
```
sessions_send(
  agentId="ce",  ✅ Registered ID
  ...
)
```

Same fix for SDR:
- `agentId="sdr"` (Registered ID)

---

## 📊 AGENT REGISTRY

| Agent ID | Name | Workspace | Auth | Status |
|----------|------|-----------|------|--------|
| `ce` | Content Engine | workspace-ce | ✅ | ✅ Working |
| `sdr` | SDR Automation | workspace-sdr | ✅ | ✅ Ready |
| `main` | Personal Assistant | workspace | ✅ | ✅ Working |

---

## 🧪 NEXT TEST

Send message to Lead Gen bot:
```
Expected: Routes to agentId="sdr" → Uses /home/ubuntu/.openclaw/agents/sdr/agent/auth-profiles.json → Works ✅
```

---

## ✅ STATUS

**Fix committed:** ✅  
**Dispatcher updated:** ✅  
**Correct agent IDs:** ✅  
**Auth configured:** ✅  

**Ready for testing**

