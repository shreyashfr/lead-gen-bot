# Agent Architecture — Immediate Action Plan

## 🎯 Your Questions Answered

### Q1: "Why do CE and SDR agents not have memory?"

**Root Cause:** They don't have **dedicated agents**. They run inside the MAIN session.

```
Current (BROKEN):
┌─────────────────────────────────────────┐
│         MAIN Agent Session               │
├─────────────────────────────────────────┤
│                                          │
│ dispatcher/SKILL.md                      │
│ ├─ if request from @shr488bot:           │
│ │  └─ Load CE user workspace (HERE)      │
│ │     └─ Run CE skills (STILL IN MAIN)   │
│ │        └─ Result: CE has no own memory │
│ │                                        │
│ ├─ if request from @sdr-bot:             │
│ │  └─ Load SDR user workspace (HERE)     │
│ │     └─ Run SDR skills (STILL IN MAIN)  │
│ │        └─ Result: SDR has no own memory│
│ │                                        │
│ └─ MAIN MEMORY.md mixed with all users   │
│    (privacy leak + context pollution)    │
│                                          │
└─────────────────────────────────────────┘

Problem: workspace-ce/memory/ is empty ✗
Problem: workspace-sdr/memory/ is unused ✗
```

---

### Q2: "Are we using memory of main agent for them?"

**Yes, exactly.** All requests go through MAIN, so they share MAIN's memory:

```
Request flow:
User message → MAIN dispatcher
            → Reads MEMORY.md (Shreyash's personal context)
            → Loads CE user workspace
            → Executes CE skills
            → All in MAIN session
            → workspace-ce/memory/ never gets written to

Result: CE agent learns nothing (no dedicated session)
        SDR agent learns nothing (no dedicated session)
```

---

### Q3: "From where are the requests of @shr488bot and SDR bot being passed?"

**MAIN agent only.** This is the bottleneck.

```
Current Architecture:
┌──────────────────┐
│ Telegram         │
├──────────────────┤
│ @shr488bot ──────────┐
│ @sdr-bot ─────────┐  │
│ Personal msgs ──┐ │  │
└──────────────────┘ │  │
                     │  │
                     ▼  ▼
                  MAIN Agent
                  (all requests)
                  (all memory)
                  (bottleneck)

Problem: All bots route to MAIN only ✗
Problem: MAIN is a single point of failure ✗
Problem: Can't scale beyond ~50 concurrent users ✗
```

---

### Q4: "Should we use dedicated agents for fulfilling the needs?"

**YES, absolutely correct.** Here's what we should do:

```
Proposed Architecture:
┌──────────────────┐
│ Telegram         │
├──────────────────┤
│ @shr488bot ──────────────┐
│ @sdr-bot ─────────────┐  │
│ Personal msgs ──────┐ │  │
└──────────────────┘ │  │  │
                     │  │  │
                  MAIN Agent (lightweight router)
                  │        │          │
      ┌───────────┼─┬──────┼──┬───────┘
      │           │ │      │  │
      ▼           ▼ │      ▼  ▼
   Personal    CE Agent    SDR Agent
   (MAIN)      (dedicated) (dedicated)
   
   Memory:      Memory:     Memory:
   MEMORY.md    workspace-ce/ workspace-sdr/
               (grows)      (grows)

Result: Each agent has own memory ✓
Result: Complete isolation + privacy ✓
Result: Can scale to 1000+ users ✓
```

---

## 📋 IMMEDIATE ACTIONS (This Week)

### Action 1: Create CE Agent Directory Structure

```bash
# Run these commands now:

# Create directories
mkdir -p /home/ubuntu/.openclaw/agents/content-engine
mkdir -p /home/ubuntu/.openclaw/agents/content-engine/memory
mkdir -p /home/ubuntu/.openclaw/agents/content-engine/users

# Copy existing workspace as template
cp -r /home/ubuntu/.openclaw/workspace-ce/skills \
      /home/ubuntu/.openclaw/agents/content-engine/

# Result:
# ✅ /home/ubuntu/.openclaw/agents/content-engine/
#    ├── skills/ (all 19 CE skills)
#    ├── memory/ (empty, will be filled)
#    ├── users/ (user workspaces)
#    └── [identity files to create]
```

**Verification:**
```bash
ls -la /home/ubuntu/.openclaw/agents/content-engine/
# Should show: skills/, memory/, users/
```

---

### Action 2: Create SDR Agent Directory Structure

```bash
# Run these commands now:

# Create directories
mkdir -p /home/ubuntu/.openclaw/agents/sdr-automation
mkdir -p /home/ubuntu/.openclaw/agents/sdr-automation/memory
mkdir -p /home/ubuntu/.openclaw/agents/sdr-automation/users

# Copy existing workspace as template
cp -r /home/ubuntu/.openclaw/workspace-sdr/skills \
      /home/ubuntu/.openclaw/agents/sdr-automation/

# Result:
# ✅ /home/ubuntu/.openclaw/agents/sdr-automation/
#    ├── skills/ (sdr-automation + sub-skills)
#    ├── memory/ (empty, will be filled)
#    ├── users/ (user workspaces)
#    └── [identity files to create]
```

**Verification:**
```bash
ls -la /home/ubuntu/.openclaw/agents/sdr-automation/
# Should show: skills/, memory/, users/
```

---

### Action 3: Create CE Agent Identity Files

**File: `/home/ubuntu/.openclaw/agents/content-engine/IDENTITY.md`**

```markdown
# IDENTITY.md - Content Engine Agent

- **Name:** Content Engine Agent
- **Role:** Dispatcher for @shr488bot
- **Workspace:** /home/ubuntu/.openclaw/agents/content-engine/
- **Focus:** Content creation workflows
- **Users:** Multi-user (isolated workspaces)
```

**File: `/home/ubuntu/.openclaw/agents/content-engine/SOUL.md`**

```markdown
# SOUL.md - Content Engine Agent

I am the dispatcher for @shr488bot. My job:
- Route user messages to their workspace
- Learn their voice preferences
- Orchestrate content workflows (pillar → research → ideas → draft → publish)
- Update their voice-memory.json with learnings

I do NOT have access to Shreyash's personal data.
I keep each user's data isolated in their workspace.
```

**File: `/home/ubuntu/.openclaw/agents/content-engine/MEMORY.md`**

```markdown
# MEMORY.md - Content Engine Agent

## About This Agent
- Role: Content Engine (@shr488bot) dispatcher
- Workspace: /home/ubuntu/.openclaw/agents/content-engine/
- Users: 5-10 Content Engine users (isolated)

## System Learnings
[Daily observations from CE workflows]

## Skill Performance Tracking
[What works, what doesn't]

## Voice Guardian Patterns
[Common rejection reasons, fixes]
```

---

### Action 4: Create SDR Agent Identity Files

**File: `/home/ubuntu/.openclaw/agents/sdr-automation/IDENTITY.md`**

```markdown
# IDENTITY.md - SDR Automation Agent

- **Name:** SDR Automation Agent
- **Role:** Dispatcher for Lead Gen bot
- **Workspace:** /home/ubuntu/.openclaw/agents/sdr-automation/
- **Focus:** Lead scanning (Signal 1 & 2)
- **Users:** Multi-user (isolated workspaces)
```

**File: `/home/ubuntu/.openclaw/agents/sdr-automation/SOUL.md`**

```markdown
# SOUL.md - SDR Automation Agent

I am the dispatcher for the Lead Gen bot. My job:
- Route scan requests to correct user workspace
- Detect signal type (HIRING vs RECENTLY FUNDED)
- Execute lead scanning (orchestrate sources)
- Track which signals/sources work best for each user
- Update user's scan-history.json with learnings

I do NOT have access to Shreyash's personal data.
I keep each user's data isolated in their workspace.
```

**File: `/home/ubuntu/.openclaw/agents/sdr-automation/MEMORY.md`**

```markdown
# MEMORY.md - SDR Automation Agent

## About This Agent
- Role: Lead Gen (SDR bot) dispatcher
- Workspace: /home/ubuntu/.openclaw/agents/sdr-automation/
- Users: 5-10 SDR users (isolated)

## System Learnings
[Daily observations from scan requests]

## Signal Accuracy Tracking
[Signal 1 vs Signal 2 performance]

## Source Performance Tracking
[LinkedIn, Indeed, YC, Wellfound accuracy]
```

---

## ✅ IMMEDIATE CHECKLIST (Complete This Week)

### Today (Action Items 1-4)
- [ ] Run: Create CE Agent directory structure
- [ ] Run: Create SDR Agent directory structure
- [ ] Create: CE Agent IDENTITY.md + SOUL.md + MEMORY.md
- [ ] Create: SDR Agent IDENTITY.md + SOUL.md + MEMORY.md

### Verify Setup
```bash
# Check directories exist:
ls -la /home/ubuntu/.openclaw/agents/content-engine/
ls -la /home/ubuntu/.openclaw/agents/sdr-automation/

# Check files exist:
ls -la /home/ubuntu/.openclaw/agents/content-engine/{IDENTITY,SOUL,MEMORY}.md
ls -la /home/ubuntu/.openclaw/agents/sdr-automation/{IDENTITY,SOUL,MEMORY}.md
```

---

## 🔄 NEXT STEPS (Next Week)

### Step 1: Update MAIN Agent Routing Logic
- Modify MAIN dispatcher/SKILL.md
- Add logic to detect bot source
- Implement sessions_send to CE Agent
- Implement sessions_send to SDR Agent
- Test routing with sample messages

### Step 2: Test Isolated Sessions
- Send test message to @shr488bot → verify routes to CE Agent
- Send test message to SDR bot → verify routes to SDR Agent
- Verify memory updates in each agent's workspace
- Verify no data leaks between agents

### Step 3: Monitor Memory Growth
- Check /home/ubuntu/.openclaw/agents/content-engine/memory/ grows daily
- Check /home/ubuntu/.openclaw/agents/sdr-automation/memory/ grows daily
- Verify users' voice-memory.json files are created
- Verify users' scan-history.json files are created

---

## 💾 WHAT MEMORY WILL LOOK LIKE

### CE Agent Memory (After 1 Week)
```
/home/ubuntu/.openclaw/agents/content-engine/
├── memory/
│   ├── 2026-03-24.md (Mar 24 logs - first day)
│   ├── 2026-03-25.md (Mar 25 logs)
│   └── [more daily logs...]
│
├── users/
│   ├── [user_1_id]/
│   │   ├── voice-memory.json (learned preferences)
│   │   ├── feedback_log (what was approved/rejected)
│   │   └── performance.json (which formats work)
│   │
│   └── [user_2_id]/
│       ├── voice-memory.json
│       ├── feedback_log
│       └── performance.json
│
└── MEMORY.md (accumulated learnings)
```

### SDR Agent Memory (After 1 Week)
```
/home/ubuntu/.openclaw/agents/sdr-automation/
├── memory/
│   ├── 2026-03-24.md (Mar 24 logs - first day)
│   ├── 2026-03-25.md (Mar 25 logs)
│   └── [more daily logs...]
│
├── users/
│   ├── [user_1_id]/
│   │   ├── scan-history.json (past scans)
│   │   ├── signal-accuracy.json (Signal 1 vs 2)
│   │   ├── source-breakdown.json (source performance)
│   │   └── ICP-profile.json (saved preferences)
│   │
│   └── [user_2_id]/
│       ├── scan-history.json
│       ├── signal-accuracy.json
│       ├── source-breakdown.json
│       └── ICP-profile.json
│
└── MEMORY.md (accumulated learnings)
```

---

## 📊 BEFORE/AFTER COMPARISON

### BEFORE (Current State)
```
❌ workspace-ce/memory/ → EMPTY (0 bytes)
❌ workspace-sdr/memory/ → UNUSED (5KB, no writes)
❌ All requests → MAIN session
❌ All memory → Mixed in MAIN MEMORY.md
❌ Privacy → Risky (data mixing)
❌ Scalability → Bottleneck at MAIN
```

### AFTER (Next Week)
```
✅ /home/ubuntu/.openclaw/agents/content-engine/memory/ → GROWING
✅ /home/ubuntu/.openclaw/agents/sdr-automation/memory/ → GROWING
✅ CE requests → CE Agent session
✅ SDR requests → SDR Agent session
✅ MAIN memory → Shreyash only (clean)
✅ Privacy → Isolated (safe)
✅ Scalability → Agents scale independently
```

---

## 🎯 SUCCESS CRITERIA

After this week, you'll know it worked when:

1. **Directories created:** ✅
   ```bash
   ls /home/ubuntu/.openclaw/agents/content-engine/
   ls /home/ubuntu/.openclaw/agents/sdr-automation/
   ```

2. **Identity files created:** ✅
   ```bash
   ls /home/ubuntu/.openclaw/agents/*/IDENTITY.md
   ls /home/ubuntu/.openclaw/agents/*/SOUL.md
   ls /home/ubuntu/.openclaw/agents/*/MEMORY.md
   ```

3. **Memory directories ready:** ✅
   ```bash
   ls /home/ubuntu/.openclaw/agents/content-engine/memory/
   ls /home/ubuntu/.openclaw/agents/sdr-automation/memory/
   ```

---

## 🚀 WHY DO THIS NOW

### Current Problems
- ❌ CE has no memory (can't learn)
- ❌ SDR has no memory (can't improve)
- ❌ MAIN session is bottleneck (can't scale)
- ❌ Privacy risk (data mixing)

### Fixed Next Week
- ✅ CE has dedicated agent + memory (learns daily)
- ✅ SDR has dedicated agent + memory (tracks accuracy)
- ✅ MAIN is lightweight router (scalable)
- ✅ Complete isolation (privacy safe)

### Business Impact
- **Content Engine:** Can scale from 5 to 50+ users (growth 10x)
- **Lead Gen:** Can scale from 5 to 50+ users (growth 10x)
- **Main Assistant:** Cleaner, faster, focused on Shreyash only

---

## 📞 SUMMARY

**Your Observation:** CE and SDR agents have no memory, everything goes through MAIN

**Root Cause:** They're not dedicated agents, they run inside MAIN session

**Solution:** Create dedicated agents with isolated memory

**Timeline:** 
- **This week:** Create directories + identity files (2 hours)
- **Next week:** Implement routing logic + test (4 hours)
- **Result:** Fully functional, memory-aware agents

**Implementation Difficulty:** Easy (just file copies + routing logic)

**Impact:** Game-changing for scalability + privacy

---

## ✅ READY TO EXECUTE

All planning documents created:
- ✅ AGENT_ARCHITECTURE_SUMMARY.md (overview)
- ✅ AGENT_ARCHITECTURE_CURRENT_VS_PROPOSED.md (detailed analysis)
- ✅ AGENT_SETUP_IMPLEMENTATION_GUIDE.md (step-by-step)
- ✅ AGENT_ARCHITECTURE_ACTION_PLAN.md (this file - immediate actions)

**Next:** Execute the immediate actions this week, then routing logic next week.

