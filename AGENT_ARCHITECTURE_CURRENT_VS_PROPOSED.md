# Agent Architecture: Current vs Proposed

## 🔴 CURRENT STATE (Problem)

### Current Bot Structure
```
Telegram
  ↓
@shr488bot (Content Engine)
  ↓
Message arrives
  ↓
[MAIN SESSION ONLY]
  dispatcher/SKILL.md
  ├─ Identifies user
  ├─ Loads user workspace
  ├─ Routes to:
  │  ├─ payment-gate (if new user)
  │  ├─ onboarding (if paid)
  │  └─ content-engine (pillar-workflow)
  └─ EVERYTHING runs in main session
       (all requests go through main agent)
```

### Issues with Current Approach

1. **🔴 No Dedicated Content Engine Agent**
   - All CE requests (pillar-workflow, research-agent, idea-generator) run in MAIN session
   - Main session memory is polluted with CE user data (privacy issue)
   - Scaling problem: if 100 CE users, main session handles 100 concurrent workflows

2. **🔴 No Memory Isolation**
   - Content Engine users' data stored in shared memory
   - CE doesn't have its own memory (workspace-ce/memory/ is EMPTY)
   - SDR automation has memory (workspace-sdr/memory/) but not used properly

3. **🔴 No Dedicated SDR Agent**
   - Lead Gen requests are NOT using dedicated agent
   - Everything still going through main session
   - No separate memory for SDR decisions/learnings

4. **🔴 No Message Routing Logic**
   - Both bots (@shr488bot and potential SDR bot) route through MAIN
   - No dispatcher to choose which agent should handle it
   - Mixing personal requests (Shreyash) with bot requests (CE users)

5. **🔴 Privacy Leaks**
   - Shreyash's context (USER.md, MEMORY.md) mixed with CE users
   - CE user data visible in main session
   - No isolation between multi-user systems

---

## 🟢 PROPOSED STATE (Solution)

### Dedicated Agent Architecture

```
                    ┌─────────────────────────────┐
                    │   Telegram Messages        │
                    └──────────┬──────────────────┘
                               │
                               ▼
            ┌──────────────────────────────────┐
            │    Message Router / Dispatcher  │
            │    (runs in MAIN session)       │
            └──────┬───────────┬────────────┬──┘
                   │           │            │
         ┌─────────▼─┐  ┌──────▼─────┐  ┌──▼──────────┐
         │           │  │            │  │             │
      PERSONAL       CE BOT          SDR BOT       ADMIN
      REQUEST        @shr488bot      @[sdr-bot]    COMMAND
         │           │               │              │
         ▼           ▼               ▼              ▼
    ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ MAIN    │  │ CE       │  │ SDR      │  │ ADMIN    │
    │ AGENT   │  │ AGENT    │  │ AGENT    │  │ AGENT    │
    │         │  │          │  │          │  │          │
    │Personal │  │Dispatcher│  │Dispatcher│  │Commands  │
    │context  │  │dispatcher│  │dispatcher│  │config    │
    │MEMORY   │  │          │  │          │  │          │
    │USER.md  │  │MEMORY.md │  │MEMORY.md │  │         │
    └─────────┘  │(isolated)│  │(isolated)│  └──────────┘
                 │          │  │          │
                 │pillar-   │  │sdr-auto  │
                 │workflow  │  │mation    │
                 │research  │  │lead gen  │
                 │content   │  │scanning  │
                 │skills    │  │          │
                 └──────────┘  └──────────┘
```

### New Agent Setup

#### **Agent 1: MAIN Agent** (Shreyash's Personal Assistant)
- **Workspace:** `/home/ubuntu/.openclaw/workspace/`
- **Identity:** Personal assistant (Shreyash's context)
- **Memory:** MEMORY.md + USER.md (personal)
- **Responsibilities:**
  - Personal requests
  - Scheduling, reminders
  - Admin commands
  - Bot routing decisions
- **Context:** Full access to Shreyash's personal data

#### **Agent 2: CONTENT ENGINE Agent** (CE Dispatcher)
- **Workspace:** `/home/ubuntu/.openclaw/workspace-ce/`
- **Identity:** Content Engine dispatcher
- **Memory:** `workspace-ce/memory/YYYY-MM-DD.md` + `workspace-ce/MEMORY.md`
- **Responsibilities:**
  - Route CE messages to correct user workspace
  - Load user dispatcher (per-user isolation)
  - Orchestrate pillar-workflow, research-agent, etc.
  - Manage CE skill workflows
- **Context:** NO access to Shreyash's personal data
- **Users:** 5-10 Content Engine users (isolated workspaces)

#### **Agent 3: SDR AUTOMATION Agent** (Lead Gen Dispatcher)
- **Workspace:** `/home/ubuntu/.openclaw/workspace-sdr/`
- **Identity:** Lead Gen bot dispatcher
- **Memory:** `workspace-sdr/memory/YYYY-MM-DD.md` + `workspace-sdr/MEMORY.md`
- **Responsibilities:**
  - Route SDR messages to correct user workspace
  - Load user dispatcher (per-user isolation)
  - Orchestrate lead scanning (Signal 1 & 2)
  - Manage SDR skill workflows
- **Context:** NO access to Shreyash's personal data
- **Users:** 5-10 SDR users (isolated workspaces)

#### **Agent 4: ADMIN Agent** (Optional, for infrastructure)
- **Workspace:** `/home/ubuntu/.openclaw/workspace/`
- **Identity:** Admin/infrastructure
- **Memory:** Shared with MAIN
- **Responsibilities:**
  - System monitoring
  - Deployment management
  - Skill updates
  - Cross-system health checks

---

## 📊 COMPARISON: Current vs Proposed

| Aspect | Current | Proposed | Benefit |
|--------|---------|----------|---------|
| **CE Bot Handling** | MAIN session | Dedicated CE Agent | Isolation + scalability |
| **SDR Bot Handling** | MAIN session | Dedicated SDR Agent | Isolation + scalability |
| **CE Memory** | None (no /memory/) | workspace-ce/memory/ | Continuity + learning |
| **SDR Memory** | workspace-sdr/memory/ | workspace-sdr/memory/ | Learning + decisions |
| **Privacy** | Mixed (risk) | Isolated (safe) | No data leaks |
| **Message Routing** | Hard-coded | Dynamic dispatcher | Flexibility |
| **User Isolation** | Per-workspace only | Agent-level + workspace | Complete isolation |
| **Scaling** | Main session bottleneck | Agents scale independently | High concurrency |
| **Context Pollution** | MEMORY.md polluted | Each agent has own memory | Clean separation |

---

## 🔄 MESSAGE FLOW: CURRENT vs PROPOSED

### CURRENT FLOW (Problem)

```
User sends: "scan: 15 leads"
  ↓
Telegram → @shr488bot (or any bot)
  ↓
Message router (dispatcher in MAIN)
  ↓
Identifies sender_id
  ↓
Load workspace: workspace-ce/users/[sender_id]/
  ↓
Read MEMORY.md (personal + CE context mixed)
  ↓
Run dispatcher/SKILL.md
  ↓
Execute pillar-workflow / sdr-automation
  ↓
Return results

Problems:
❌ All in MAIN session
❌ Main context polluted
❌ No dedicated CE agent memory
❌ No dedicated SDR agent memory
❌ Can't scale
```

### PROPOSED FLOW (Solution)

```
User sends: "scan: 15 leads"
  ↓
Telegram → @shr488bot
  ↓
Message Router (in MAIN)
  │
  ├─ Parse metadata: sender_id, chat_id, message_text
  ├─ Check: Is this CE? Yes → route to CE Agent
  ├─ Send via sessions_send to CE Agent session
  └─ Yield, wait for CE Agent response

CE Agent (Dedicated Session)
  ├─ Receive message in isolated session
  ├─ Read: workspace-ce/memory/YYYY-MM-DD.md
  ├─ Load user workspace: workspace-ce/users/[sender_id]/
  ├─ Execute dispatcher/SKILL.md
  ├─ Run pillar-workflow / content engine skills
  ├─ Update workspace-ce/memory/ with learnings
  └─ Return results to MAIN

MAIN Agent (Receives response)
  └─ Forward to Telegram → user

Benefits:
✅ MAIN stays clean
✅ CE has dedicated agent + memory
✅ No context pollution
✅ Scalable
✅ Private
```

---

## 🎯 IMPLEMENTATION PLAN

### Phase 1: Create Dedicated Agents (This Week)

#### Step 1: Create CE Agent (Copy to new agent)
```bash
# Setup CE Agent workspace
mkdir -p /home/ubuntu/.openclaw/agents/content-engine
cp -r /home/ubuntu/.openclaw/workspace-ce/* /home/ubuntu/.openclaw/agents/content-engine/

# Create CE Agent memory
mkdir -p /home/ubuntu/.openclaw/agents/content-engine/memory
```

**Agent Identity (CE Agent):**
```
name: content-engine-agent
description: Dedicated agent for Content Engine bot (@shr488bot). Routes user messages to correct workspace, executes dispatcher, manages content workflows.
model: anthropic/claude-sonnet-4-6
workspace: /home/ubuntu/.openclaw/agents/content-engine/
```

#### Step 2: Create SDR Agent (Copy to new agent)
```bash
# Setup SDR Agent workspace
mkdir -p /home/ubuntu/.openclaw/agents/sdr-automation
cp -r /home/ubuntu/.openclaw/workspace-sdr/* /home/ubuntu/.openclaw/agents/sdr-automation/

# Create SDR Agent memory
mkdir -p /home/ubuntu/.openclaw/agents/sdr-automation/memory
```

**Agent Identity (SDR Agent):**
```
name: sdr-automation-agent
description: Dedicated agent for Lead Gen bot (SDR Automation). Routes user messages to correct workspace, executes dispatcher, manages lead scanning workflows.
model: anthropic/claude-sonnet-4-6
workspace: /home/ubuntu/.openclaw/agents/sdr-automation/
```

#### Step 3: Update MAIN Agent (Message Router)
```
Update MAIN dispatcher logic:
├─ Receive Telegram message
├─ Parse sender_id + message_text
├─ Detect: Is this from @shr488bot?
│  YES → route to CE Agent via sessions_send
├─ Detect: Is this from @sdr-bot?
│  YES → route to SDR Agent via sessions_send
├─ Otherwise → handle as personal (MAIN)
└─ Yield and wait for agent response
```

### Phase 2: Setup Memory for Each Agent (This Week)

#### Content Engine Agent Memory
```
workspace-ce/memory/
├── YYYY-MM-DD.md (daily logs)
├── MEMORY.md (long-term per-user learnings)
└── users/
    ├── [user_1_id]/
    │   ├── voice-memory.json (learnings)
    │   └── performance.json
    └── [user_2_id]/
        ├── voice-memory.json
        └── performance.json
```

**CE Agent MEMORY.md:**
```
# Content Engine Agent Memory

## About This Agent
- Role: Dispatcher for @shr488bot (Content Engine)
- Workspace: /home/ubuntu/.openclaw/workspace-ce/
- Users: 5-10 Content Engine users (isolated workspaces)

## System Learnings
[Observations about CE workflows, failures, patterns]

## User Patterns (aggregate)
[Cross-user insights]

## Skill Performance
[Which skills work best, failure modes]
```

#### SDR Automation Agent Memory
```
workspace-sdr/memory/
├── YYYY-MM-DD.md (daily logs)
├── MEMORY.md (long-term system learnings)
└── users/
    ├── [user_1_id]/
    │   ├── signal-learnings.json
    │   └── source-accuracy.json
    └── [user_2_id]/
        ├── signal-learnings.json
        └── source-accuracy.json
```

**SDR Agent MEMORY.md:**
```
# SDR Automation Agent Memory

## About This Agent
- Role: Dispatcher for Lead Gen bot (SDR Automation)
- Workspace: /home/ubuntu/.openclaw/workspace-sdr/
- Users: 5-10 SDR users (isolated workspaces)

## Signal Learnings
[Signal 1 accuracy, Signal 2 accuracy]

## Source Performance
[LinkedIn accuracy, Indeed accuracy, YC accuracy]

## User Patterns
[Common queries, preferred signals]
```

### Phase 3: Test Routing (Next Week)

#### Test CE Agent
```
1. Send message to @shr488bot
2. MAIN routes to CE Agent
3. CE Agent handles message
4. Results returned to user
5. Verify memory updated
```

#### Test SDR Agent
```
1. Send message to @sdr-bot (new bot)
2. MAIN routes to SDR Agent
3. SDR Agent handles message
4. Results returned to user
5. Verify memory updated
```

### Phase 4: Production Deployment (Next Week)

1. Configure agents in OpenClaw
2. Deploy CE Agent session
3. Deploy SDR Agent session
4. Monitor for 1 week
5. Gather metrics + feedback

---

## 💾 MEMORY STRUCTURE (Detailed)

### MAIN Agent Memory
```
/home/ubuntu/.openclaw/workspace/MEMORY.md
├── Personal context (Shreyash)
├── Preferences + boundaries
├── System configuration
├── Agent routing rules
└── Cross-agent observations
```

### CE Agent Memory
```
/home/ubuntu/.openclaw/workspace-ce/MEMORY.md
├── Agent identity + responsibilities
├── System-wide CE learnings
├── Skill performance patterns
├── User behavior patterns (aggregate)
└── Failure modes + solutions

/home/ubuntu/.openclaw/workspace-ce/users/[user_id]/voice-memory.json
├── voice_rules (per-user)
├── voice_lessons (per-user)
├── feedback_log (per-user)
├── high_performers (per-user)
└── batch_analysis (per-user)
```

### SDR Agent Memory
```
/home/ubuntu/.openclaw/workspace-sdr/MEMORY.md
├── Agent identity + responsibilities
├── Signal accuracy metrics
├── Source performance data
├── User behavior patterns
└── Lead quality observations

/home/ubuntu/.openclaw/workspace-sdr/users/[user_id]/
├── scan-history.json (queries + results)
├── signal-accuracy.json (Signal 1 vs 2 performance)
├── source-breakdown.json (which sources deliver best leads)
└── user-preferences.json (ICP + settings)
```

---

## 🔐 PRIVACY & ISOLATION

### Current (UNSAFE)
```
MAIN session memory contains:
├── Shreyash's personal data
├── 10 CE users' data
├── 5 SDR users' data
└── All mixed together (RISK)
```

### Proposed (SAFE)
```
MAIN session memory:
├── Shreyash's personal data only
└── Routing rules + configuration

CE Agent memory:
├── CE system learnings
└── Per-user data in isolated workspaces

SDR Agent memory:
├── SDR system learnings
└── Per-user data in isolated workspaces

Guarantee:
✅ Shreyash's data NOT visible to CE/SDR agents
✅ CE users' data NOT visible to SDR agents
✅ SDR users' data NOT visible to CE agents
✅ No cross-user data leaks
```

---

## 📈 SCALABILITY

### Current (Bottleneck)
```
MAIN session handles:
├── Personal requests (Shreyash)
├── 100 CE user messages (all queued)
└── 50 SDR user messages (all queued)
    = MAIN session is saturated
```

### Proposed (Scalable)
```
MAIN session: Lightweight routing only
  ├── Parse message (< 1 sec)
  ├── Identify user + type
  └── Forward to appropriate agent

CE Agent session: Handles all CE requests
  ├── 100 CE users → parallel execution
  └─ Dedicated memory + context

SDR Agent session: Handles all SDR requests
  ├── 50 SDR users → parallel execution
  └─ Dedicated memory + context

Result: Can scale to 1000+ users
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Agent Creation
- [ ] Create CE Agent workspace structure
- [ ] Create SDR Agent workspace structure
- [ ] Create agent identity files (IDENTITY.md, SOUL.md, etc.)
- [ ] Setup memory directories
- [ ] Test basic routing logic

### Phase 2: Memory Setup
- [ ] Create workspace-ce/MEMORY.md
- [ ] Create workspace-sdr/MEMORY.md
- [ ] Setup per-user memory structure
- [ ] Create initialization templates

### Phase 3: Routing Logic
- [ ] Update MAIN dispatcher to detect bot source
- [ ] Implement sessions_send to CE Agent
- [ ] Implement sessions_send to SDR Agent
- [ ] Add message routing logic
- [ ] Test routing with sample messages

### Phase 4: Testing
- [ ] Test CE Agent with real CE user message
- [ ] Test SDR Agent with real SDR user message
- [ ] Verify memory updates
- [ ] Verify privacy isolation
- [ ] Verify no context pollution

### Phase 5: Monitoring
- [ ] Setup logs for routing decisions
- [ ] Monitor agent performance
- [ ] Track memory growth
- [ ] Alert on errors/failures

---

## 🎯 SUMMARY

### Current Problem
- ❌ No dedicated agents (all in MAIN)
- ❌ No memory isolation (MAIN mixed with users)
- ❌ CE has no memory (workspace-ce/memory/ empty)
- ❌ Privacy risk (data mixing)
- ❌ Scalability issue (MAIN bottleneck)

### Proposed Solution
- ✅ Dedicated CE Agent (with isolated memory)
- ✅ Dedicated SDR Agent (with isolated memory)
- ✅ MAIN routes messages only (lightweight)
- ✅ Each agent has own MEMORY.md
- ✅ Complete privacy + isolation
- ✅ Scalable architecture

### Timeline
- **Phase 1:** This week (agent setup)
- **Phase 2:** This week (memory setup)
- **Phase 3:** Next week (routing + testing)
- **Phase 4:** Next week (production deployment)

---

## 📞 QUESTIONS ANSWERED

**Q: Why is CE empty at workspace-ce/memory/?**
A: Because dispatcher runs in MAIN session. It has no dedicated agent/session to maintain memory.

**Q: Are we using memory of main agent for them?**
A: Yes, currently all requests go through MAIN session, mixing Shreyash's context with CE users.

**Q: Where are requests from shr488bot and SDR bot being passed?**
A: They're all routed to MAIN session (via main dispatcher). They should have dedicated agents.

**Q: Should we use dedicated agents?**
A: Yes, absolutely. This is the correct architecture:
- MAIN = personal assistant only
- CE Agent = content engine dispatcher only
- SDR Agent = lead gen dispatcher only
- Complete isolation + scalability

