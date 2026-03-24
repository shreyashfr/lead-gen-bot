# Phases 2-4 Implementation — Safety First

## ⚠️ CRITICAL BEFORE WE PROCEED

**What we've done (Phase 1):**
- ✅ Created agent workspaces
- ✅ Created identity files
- ✅ Created memory directories
- ✅ Zero risk (just file copies)

**What Phases 2-4 do:**
- 🔴 MODIFY dispatcher logic in MAIN agent
- 🔴 CHANGE message routing
- 🔴 AFFECT all bot requests
- 🔴 HIGH RISK if done wrong

---

## ⚠️ RISK ASSESSMENT

### If Phases 2-4 work correctly ✅
- All CE requests → CE Agent (good)
- All SDR requests → SDR Agent (good)
- All personal requests → MAIN (good)
- Users see no difference (transparent)

### If Phases 2-4 break ❌
- @shr488bot stops responding
- Lead Gen bot stops responding
- Personal assistant stops responding
- Users can't reach bots
- Data may be lost

---

## 🛡️ SAFETY STRATEGY

### What I recommend:

**Option A: Full Implementation (Safe)**
```
1. Implement Phase 2 (routing logic)
2. TEST thoroughly with test messages
3. When working: Deploy Phase 3 (testing)
4. Monitor Phase 4 (production)
5. Total: ~6.5 hours over 2 weeks
6. Risk: Low (incremental testing)
```

**Option B: Fast Implementation (Riskier)**
```
1. Implement all phases now
2. Hope it works
3. Fix if broken
4. Total: ~2 hours
5. Risk: Medium-High (no testing first)
```

---

## 📋 WHAT PHASE 2 REQUIRES (Routing Logic)

This is the critical piece. It needs to:

1. **Detect message source**
   - Is it from @shr488bot? → Route to CE Agent
   - Is it from @sdr-bot? → Route to SDR Agent
   - Otherwise → Handle as personal

2. **Implement routing**
   - Use `sessions_send()` to CE Agent
   - Use `sessions_send()` to SDR Agent
   - Yield and wait for response
   - Forward response to user

3. **Error handling**
   - What if agent crashes?
   - What if agent returns error?
   - What if timeout?
   - What if user data lost?

4. **Testing points**
   - Log all routing decisions
   - Verify message reaches agent
   - Verify agent responds
   - Verify response sent to user

---

## 🎯 MY RECOMMENDATION

**Implement all phases, but with a safety net:**

### Phase 2: Implement routing logic
```python
# In MAIN Agent dispatcher/SKILL.md

def route_message(sender_id, message_text, metadata):
    """Route to correct agent"""
    
    # Detect source
    if metadata.get('from_bot') == 'shr488bot':
        # CE message
        try:
            response = sessions_send(
                agentId="content-engine-agent",
                message=message_text,
                metadata={'sender_id': sender_id}
            )
            return response
        except Exception as e:
            # FALLBACK: Log error, inform user
            log_error(f"CE Agent failed: {e}")
            return "CE Agent temporarily unavailable"
    
    elif metadata.get('from_bot') == 'sdr-bot':
        # SDR message
        try:
            response = sessions_send(
                agentId="sdr-automation-agent",
                message=message_text,
                metadata={'sender_id': sender_id}
            )
            return response
        except Exception as e:
            # FALLBACK: Log error, inform user
            log_error(f"SDR Agent failed: {e}")
            return "SDR Agent temporarily unavailable"
    
    else:
        # Personal message - handle in MAIN
        return handle_personal_request(message_text)
```

### Phase 3: Test with sample messages
- Test 1: Send "Pillar: AI Strategy" to CE Agent
- Test 2: Send "scan: 10 VP at SaaS" to SDR Agent
- Test 3: Send personal message to MAIN
- Verify all routes work

### Phase 4: Monitor and deploy
- Watch logs for 24 hours
- Check for errors
- Deploy to production

---

## 🚨 IF SOMETHING BREAKS

**Rollback plan:**
1. Revert dispatcher changes
2. Requests go back to MAIN
3. Services restored
4. Diagnose issue
5. Fix and test again

---

## 📊 IMPLEMENTATION CHECKLIST

### Pre-Implementation
- [ ] Backup current SKILL.md
- [ ] Document current behavior
- [ ] Create rollback plan

### Phase 2: Routing Logic
- [ ] Update MAIN dispatcher
- [ ] Add CE routing logic
- [ ] Add SDR routing logic
- [ ] Add error handling
- [ ] Add logging
- [ ] Commit to git

### Phase 3: Testing
- [ ] Test CE Agent routing
- [ ] Test SDR Agent routing
- [ ] Test personal request
- [ ] Verify memory updates
- [ ] Check for data leaks

### Phase 4: Monitoring
- [ ] Monitor logs
- [ ] Check metrics
- [ ] Verify performance
- [ ] Production deployment

---

## ⏱️ TIME ESTIMATE (If implementing now)

| Phase | Task | Time | Risk |
|-------|------|------|------|
| 2 | Routing logic | 2 hrs | Medium |
| 3 | Testing | 2 hrs | Low |
| 4 | Monitoring | 0.5 hrs | Low |
| **Total** | **All phases** | **4.5 hrs** | **Low-Medium** |

---

## ✅ HOW TO IMPLEMENT SAFELY

### Step 1: Backup Current SKILL.md
```bash
cp /home/ubuntu/.openclaw/workspace/skills/dispatcher/SKILL.md \
   /home/ubuntu/.openclaw/workspace/skills/dispatcher/SKILL.md.backup-2026-03-24
```

### Step 2: Update SKILL.md with routing logic
```
Add to dispatcher/SKILL.md:

## MESSAGE ROUTING (NEW)

Before processing any message:

1. Check inbound metadata: sender_id, from_bot
2. If from_bot == 'shr488bot':
   → sessions_send to content-engine-agent
3. Else if from_bot == 'sdr-bot':
   → sessions_send to sdr-automation-agent
4. Else:
   → Handle as personal request
```

### Step 3: Test with sample messages
- Send test message to CE Agent
- Send test message to SDR Agent
- Verify responses

### Step 4: Monitor for errors
- Watch logs
- Check agent status
- Monitor performance

---

## 🎯 YOUR DECISION

**Question:** Do you want me to:

**Option A:** Implement all phases now (4.5 hours)
- Fast
- Higher risk if something breaks
- Will need testing/monitoring after

**Option B:** Implement Phase 2 now, Phase 3 & 4 next week
- Slower (but safe)
- Lower risk (incremental testing)
- Less likely to have major issues

**What do you prefer?**

---

## ⚠️ IMPORTANT NOTES

1. **I can implement, but need your confirmation on approach**
2. **If we go fast, we need good error handling**
3. **We should have rollback ready (backup files)**
4. **Testing will catch issues before production**

---

## DECISION NEEDED

Please choose:

**A) Fast implementation (all phases now, 4.5 hrs, test after)**
**B) Safe implementation (Phase 2 now, Phases 3-4 next week, incremental)**

Once you choose, I'll proceed immediately.

