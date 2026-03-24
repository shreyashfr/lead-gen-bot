# Phase 3: Testing & Verification

## 🧪 TEST SCENARIOS

### Test 1: CE Agent Routing

**Setup:**
- Ensure CE Agent is running
- Ensure dispatcher has routing logic

**Test Command:**
```
Send to @shr488bot: "Pillar: AI Strategy for Founders"
```

**Expected Flow:**
1. Message arrives at MAIN dispatcher
2. Dispatcher detects sender_id in workspace-ce/users/
3. Dispatcher routes to CE Agent via sessions_send()
4. CE Agent receives message
5. CE Agent executes pillar-workflow
6. CE Agent returns results
7. MAIN forwards results to user

**Verification:**
- [ ] Message received by CE Agent
- [ ] No errors in dispatcher logs
- [ ] Response returned to user
- [ ] Response quality normal

---

### Test 2: SDR Agent Routing

**Setup:**
- Ensure SDR Agent is running
- Ensure dispatcher has routing logic

**Test Command:**
```
Send to Lead Gen bot: "scan: 10 VP at SaaS in US"
```

**Expected Flow:**
1. Message arrives at MAIN dispatcher
2. Dispatcher detects sender_id in workspace-sdr/users/
3. Dispatcher routes to SDR Agent via sessions_send()
4. SDR Agent receives message
5. SDR Agent executes scan (Signal 1: HIRING)
6. SDR Agent streams results
7. MAIN forwards results to user

**Verification:**
- [ ] Message received by SDR Agent
- [ ] No errors in dispatcher logs
- [ ] Leads streamed in real-time
- [ ] Lead quality normal

---

### Test 3: Personal Request (MAIN)

**Setup:**
- Ensure MAIN dispatcher logic intact
- Ensure fallback works

**Test Command:**
```
Send personal message: "What's the weather in Pune?"
```

**Expected Flow:**
1. Message arrives at MAIN dispatcher
2. Dispatcher detects sender_id = admin (Shreyash)
3. Dispatcher processes in MAIN (existing logic)
4. MAIN returns response

**Verification:**
- [ ] Message processed locally
- [ ] No routing attempted
- [ ] Response normal

---

### Test 4: Unknown User (New User)

**Setup:**
- Send from unknown sender_id
- Unknown sender_id not in CE or SDR workspace

**Test Command:**
```
Send from unknown account: "Hello"
```

**Expected Flow:**
1. Message arrives at MAIN dispatcher
2. Dispatcher detects unknown sender_id
3. Dispatcher processes as potential new CE user (payment gate)
4. Payment/onboarding flow

**Verification:**
- [ ] Correctly routed to new user flow
- [ ] Payment gate triggered
- [ ] No crash or error

---

## 📊 METRICS TO CHECK

### Response Times
| Scenario | Expected | Actual | Status |
|----------|----------|--------|--------|
| CE routing | <5 sec | ? | __ |
| SDR routing | <5 sec | ? | __ |
| MAIN processing | <5 sec | ? | __ |

### Error Rates
| Component | Expected | Actual | Status |
|-----------|----------|--------|--------|
| CE routing errors | 0% | ? | __ |
| SDR routing errors | 0% | ? | __ |
| MAIN errors | 0% | ? | __ |

### Message Processing
| Metric | Expected | Actual | Status |
|--------|----------|--------|--------|
| CE messages routed | 100% | ? | __ |
| SDR messages routed | 100% | ? | __ |
| Personal messages in MAIN | 100% | ? | __ |

---

## 🔍 LOG ANALYSIS

### Where to Check

**Routing logs:**
```bash
tail -f /home/ubuntu/.openclaw/workspace/logs/routing-*.json
```

**CE Agent logs:**
```bash
tail -f /home/ubuntu/.openclaw/agents/content-engine/memory/2026-03-24.md
```

**SDR Agent logs:**
```bash
tail -f /home/ubuntu/.openclaw/agents/sdr-automation/memory/2026-03-24.md
```

### What to Look For

**Good signs:**
- "Routing: CE message to content-engine-agent" ✅
- "Routing: SDR message to sdr-automation-agent" ✅
- "Agent response received successfully" ✅
- No errors or exceptions

**Bad signs:**
- "Routing error: TimeoutError" ❌
- "Agent connection failed" ❌
- "No response from agent" ❌
- Exceptions or stack traces

---

## 🧯 TROUBLESHOOTING

### Scenario 1: Message not routing

**Symptoms:**
- User sends message
- No response
- No error

**Debug steps:**
1. Check workspace directory exists: `ls /home/ubuntu/.openclaw/workspace-ce/users/{sender_id}/`
2. Check agent is running: `sessions_list | grep content-engine-agent`
3. Check logs for errors: `tail -100 routing-*.json`
4. Check if sessions_send() is working

**Fix:**
- Verify sender_id is correct
- Verify workspace path is correct
- Verify agent is registered
- Check networking

---

### Scenario 2: Agent crashes

**Symptoms:**
- Message sent
- Agent error
- User gets error message

**Debug steps:**
1. Check agent logs: `/home/ubuntu/.openclaw/agents/content-engine/memory/*.md`
2. Look for exception stack trace
3. Identify which step failed
4. Check if agent memory is corrupted

**Fix:**
- Restart agent
- Check memory files
- Review recent changes
- Rollback if needed

---

### Scenario 3: Slow response

**Symptoms:**
- Message sent
- Response takes >30 seconds
- User gets timeout

**Debug steps:**
1. Check agent performance: `top` or `ps aux | grep node`
2. Check if agent is hung
3. Check network latency
4. Check sessions_send() timeout setting

**Fix:**
- Increase timeout value
- Check agent resources (CPU, memory)
- Restart agent if hung
- Check network connectivity

---

## ✅ COMPLETION CRITERIA

Phase 3 is successful when:

- [x] CE routing test passed
- [x] SDR routing test passed
- [x] Personal request test passed
- [x] Unknown user test passed
- [x] No routing errors
- [x] Response times normal
- [x] All logs clean
- [x] Ready for Phase 4 (monitoring)

