# Phase 4: Monitoring & Production Deployment

## 📊 MONITORING SETUP

After Phase 3 testing passes, monitor for 24-48 hours before full production.

### Key Metrics

**Routing Distribution (should change):**
```
BEFORE:
├─ MAIN: 100% (CE + SDR + personal)
├─ CE Agent: 0%
└─ SDR Agent: 0%

AFTER:
├─ MAIN: ~10% (personal + admin only)
├─ CE Agent: ~45% (content engine users)
└─ SDR Agent: ~45% (SDR users)
```

**Error Rates (should stay at 0%):**
```
✅ Routing errors: 0%
✅ Timeout errors: 0%
✅ Agent crashes: 0
✅ Data loss: 0
✅ Invalid responses: 0%
```

**Response Times (should stay same):**
```
✅ CE routing: <5 sec
✅ SDR routing: <5 sec
✅ MAIN processing: <5 sec
✅ End-to-end: <30 sec
```

---

## 🔍 DAILY CHECKLIST

### Morning (Start of day)

- [ ] Check agents are running: `sessions_list | grep content-engine`
- [ ] Check logs for overnight issues: `tail routing-*.json`
- [ ] Check memory growth: `du -sh /home/ubuntu/.openclaw/agents/*/memory/`
- [ ] Check for errors: grep "error\|Error\|ERROR" logs/*

### Midday

- [ ] Spot check a CE request
- [ ] Spot check an SDR request
- [ ] Review any error logs
- [ ] Check response times

### End of Day

- [ ] Review full day logs
- [ ] Check metrics summary
- [ ] Confirm no user complaints
- [ ] Archive logs

---

## 🚨 ALERT CONDITIONS

### Critical (Immediate Action)

- [ ] Agent down: CE or SDR agent not responding
  - Action: Restart agent immediately
  - Fallback: Route to MAIN temporarily

- [ ] Routing errors > 5% of messages
  - Action: Stop routing, investigate
  - Fallback: Disable routing, route all to MAIN

- [ ] Data loss detected
  - Action: Stop everything, restore from backup
  - Fallback: Restore SKILL.md.backup

### Warning (Monitor Closely)

- [ ] Response time > 30 sec
  - Action: Investigate agent performance
  - Fallback: Increase timeout, monitor

- [ ] Agent memory > 1GB
  - Action: Archive old logs
  - Fallback: Restart agent with clean memory

### Info (Log for Analysis)

- [ ] Slow requests (10-30 sec)
- [ ] Unusual routing patterns
- [ ] High agent load

---

## 📈 METRICS TRACKING

### Daily Metrics Report

Create: `/home/ubuntu/.openclaw/workspace/logs/daily-metrics-2026-03-24.json`

```json
{
  "date": "2026-03-24",
  "routing": {
    "ce_messages": 45,
    "ce_success_rate": "100%",
    "ce_avg_response_time": "4.2s",
    "sdr_messages": 42,
    "sdr_success_rate": "100%",
    "sdr_avg_response_time": "4.8s",
    "main_messages": 12,
    "main_avg_response_time": "2.1s"
  },
  "errors": {
    "routing_errors": 0,
    "timeout_errors": 0,
    "agent_crashes": 0
  },
  "health": {
    "ce_agent_memory_mb": 245,
    "sdr_agent_memory_mb": 189,
    "main_memory_mb": 156
  },
  "status": "healthy"
}
```

---

## 🔄 INCIDENT RESPONSE

### If Routing Breaks

**Immediate (< 1 min):**
1. Disable routing: Comment out `sessions_send()` calls
2. All messages go to MAIN
3. Announce to users: "Service restored, may be slower than usual"

**Investigation (1-30 mins):**
1. Check agent logs
2. Check routing logs
3. Check network connectivity
4. Identify root cause

**Resolution (30 mins - 2 hours):**
1. Fix the issue
2. Test thoroughly
3. Re-enable routing
4. Announce restoration

**Post-Incident (24 hours):**
1. Write root cause analysis
2. Document fix
3. Prevent recurrence
4. Update playbooks

---

## 📋 PRODUCTION READINESS CHECKLIST

Before going fully live, verify:

- [x] Phase 1: Agent workspaces created
- [x] Phase 2: Routing logic implemented
- [x] Phase 3: Testing passed
- [ ] Phase 4: Monitoring running

---

## 🚀 GO-LIVE STEPS

### Step 1: Pre-Flight Check (1 hour before)
- [ ] All agents running
- [ ] All logs clean
- [ ] All backups ready
- [ ] Team aware of changes

### Step 2: Go Live (at scheduled time)
- [ ] Enable routing in SKILL.md
- [ ] Restart MAIN agent
- [ ] Monitor closely
- [ ] Watch for errors

### Step 3: First Hour
- [ ] Monitor every message
- [ ] Check response times
- [ ] Watch error logs
- [ ] Be ready to rollback

### Step 4: First Day
- [ ] Monitor continuously
- [ ] Run daily checklist
- [ ] Collect metrics
- [ ] Report status

### Step 5: First Week
- [ ] Daily monitoring
- [ ] Weekly metrics report
- [ ] Performance analysis
- [ ] Optimization ideas

---

## 📊 SUCCESS METRICS

**Go-live is successful when:**

- ✅ 0% routing errors
- ✅ 0% timeouts
- ✅ 0% agent crashes
- ✅ 0% data loss
- ✅ Response times < 30 sec
- ✅ CE messages routing > 90%
- ✅ SDR messages routing > 90%
- ✅ Personal messages in MAIN 100%
- ✅ Users report normal service
- ✅ No critical issues in 24 hours

---

## 🎯 FUTURE OPTIMIZATIONS

After Phase 4 completes and system is stable:

1. **Optimize response times**
   - Profile agent execution
   - Cache common requests
   - Parallel processing

2. **Improve memory management**
   - Archive old logs
   - Compress memory files
   - Automatic cleanup

3. **Add more agents**
   - Webhook agent (for integrations)
   - Analytics agent (for metrics)
   - Admin agent (for system management)

4. **Scale beyond current users**
   - Load test agents
   - Prepare for 50+ users per agent
   - Optimize database queries

---

## 📞 SUPPORT & ESCALATION

### If Users Report Issues

**Tier 1: MAIN Agent**
- Route directly to MAIN agent
- Provide routing logs
- Offer rollback if needed

**Tier 2: Routing System**
- Check dispatcher logs
- Verify agent status
- Check network connectivity

**Tier 3: Agent Issues**
- Check agent memory
- Restart agent
- Review agent logs
- Escalate to development

---

## ✅ DEPLOYMENT COMPLETE

When all phases pass and monitoring shows stability:

- Production deployment: ✅ Complete
- System stable: ✅ Verified
- Monitoring active: ✅ Running
- Escalation ready: ✅ Prepared

**Status: 🟢 READY FOR FULL PRODUCTION**

