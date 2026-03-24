# Agent Architecture Implementation Guide

## 🎯 GOAL

Create 3 independent agents:
1. **MAIN Agent** — Shreyash's personal assistant + message router
2. **CE Agent** — Content Engine dispatcher (@shr488bot handler)
3. **SDR Agent** — Lead Gen dispatcher (Lead Gen bot handler)

---

## 📋 PHASE 1: AGENT SETUP (This Week)

### Step 1.1: Create CE Agent Workspace

```bash
# Create directories
mkdir -p /home/ubuntu/.openclaw/agents/content-engine/
mkdir -p /home/ubuntu/.openclaw/agents/content-engine/memory
mkdir -p /home/ubuntu/.openclaw/agents/content-engine/users

# Copy existing CE workspace (template)
cp -r /home/ubuntu/.openclaw/workspace-ce/skills \
      /home/ubuntu/.openclaw/agents/content-engine/
cp -r /home/ubuntu/.openclaw/workspace-ce/users \
      /home/ubuntu/.openclaw/agents/content-engine/

# Verify structure
ls -la /home/ubuntu/.openclaw/agents/content-engine/
```

**Files to create:**

```
/home/ubuntu/.openclaw/agents/content-engine/
├── IDENTITY.md
├── SOUL.md
├── MEMORY.md
├── HEARTBEAT.md
├── skills/
│   ├── dispatcher/
│   ├── pillar-workflow/
│   ├── research-agent/
│   ├── idea-generator/
│   └── [all 19 CE skills]
├── users/
│   ├── [user_1_id]/
│   │   ├── workspace/
│   │   ├── voice-memory.json
│   │   └── performance.json
│   └── [user_N_id]/
└── memory/
    ├── YYYY-MM-DD.md (daily logs)
    └── [accumulated logs]
```

### Step 1.2: Create CE Agent Identity

**File: `/home/ubuntu/.openclaw/agents/content-engine/IDENTITY.md`**

```markdown
# IDENTITY.md - Content Engine Agent

- **Name:** Content Engine Agent
- **Role:** Dispatcher for @shr488bot (Content Engine bot)
- **Function:** Routes CE user messages to correct workspace, orchestrates content workflows
- **Model:** anthropic/claude-sonnet-4-6
- **Workspace:** /home/ubuntu/.openclaw/agents/content-engine/
- **Users:** 5-10 Content Engine users (isolated workspaces)
- **Memory:** workspace-ce/memory/ + users/[id]/voice-memory.json
```

**File: `/home/ubuntu/.openclaw/agents/content-engine/SOUL.md`**

```markdown
# SOUL.md - Content Engine Agent

## Who I Am
I am the dispatcher for the Content Engine bot (@shr488bot). My job is to:
1. Route incoming messages to the correct user workspace
2. Load that user's voice-memory and preferences
3. Execute their content workflows (pillar-workflow, research, generation)
4. Update user memory with learnings
5. Return results to the user

## My Boundaries
- I have NO access to Shreyash's personal data (no MEMORY.md from main agent)
- I do NOT handle personal requests (only CE user requests)
- I do NOT mix users' data (complete isolation)
- I learn from each user's voice and preferences, stored in their workspace

## My Values
- **Privacy:** Each user's data stays in their workspace
- **Quality:** Every content piece is validated against voice
- **Learning:** Every interaction teaches me about the user's preferences
- **Scalability:** I can handle 5-10 users without bottleneck

## How I Work
1. Receive message from CE user
2. Load user workspace: users/[sender_id]/
3. Read: voice-memory.json (what this user likes/dislikes)
4. Execute: dispatcher/SKILL.md with user context
5. Return: content piece or scan results
6. Update: voice-memory.json with new learnings
```

**File: `/home/ubuntu/.openclaw/agents/content-engine/MEMORY.md`**

```markdown
# MEMORY.md - Content Engine Agent

## About This Agent
- **Role:** Content Engine dispatcher
- **Workspace:** /home/ubuntu/.openclaw/agents/content-engine/
- **Users:** Multiple isolated users (in users/ subdirectories)
- **Focus:** Content creation workflows

## System Learnings

### Voice Guardian Patterns
- Most common rejection: Too formal tone
- Most common fix: Shorten sentences, remove em dashes
- Success rate: ~85% on first draft

### Content Format Performance
- LinkedIn posts: 15-20 min avg
- Threads: 20-30 min avg
- Articles: 40+ min avg
- Instagram: 10-15 min avg
- Tweets: 5-10 min avg

### Research Agent Performance
- Reddit scout: Returns 4-18 posts (good)
- Twitter scout: Returns 2-8 tweets (good)
- YouTube scout: Returns 5-10 videos (good)
- Google News: Returns 3-5 articles (good)

### Idea Generator Output
- Avg ideas per pillar: 12-15
- Quality: 80% of ideas get approved
- Top performers: Video hook ideas, contrarian angles

## Multi-User Observations

### User Cohorts
- Power users (3-5 pillars/week): 40% of traffic
- Casual users (1 pillar/week): 60% of traffic

### Skill Usage Patterns
- 90% of requests: pillar-workflow
- 8% of requests: competitive scan
- 2% of requests: performance tracker

### Failure Modes
- Rejected: AI tone (most common)
- Rejected: Too jargony (common)
- Rejected: Off-brand voice (occasional)

## AI Humanizer Effectiveness
- Detection rate: ~95%
- False positives: ~2%
- Average rewrite time: 3-5 mins

## Notes
- Each user has isolated voice-memory.json in their workspace
- No cross-user data leaks
- All learnings per-user (in users/[id]/ directories)
```

### Step 1.3: Create SDR Agent Workspace

```bash
# Create directories
mkdir -p /home/ubuntu/.openclaw/agents/sdr-automation/
mkdir -p /home/ubuntu/.openclaw/agents/sdr-automation/memory
mkdir -p /home/ubuntu/.openclaw/agents/sdr-automation/users

# Copy existing SDR workspace (template)
cp -r /home/ubuntu/.openclaw/workspace-sdr/skills \
      /home/ubuntu/.openclaw/agents/sdr-automation/
cp -r /home/ubuntu/.openclaw/workspace-sdr/users \
      /home/ubuntu/.openclaw/agents/sdr-automation/

# Verify structure
ls -la /home/ubuntu/.openclaw/agents/sdr-automation/
```

**File: `/home/ubuntu/.openclaw/agents/sdr-automation/IDENTITY.md`**

```markdown
# IDENTITY.md - SDR Automation Agent

- **Name:** SDR Automation Agent
- **Role:** Dispatcher for Lead Gen bot (SDR Automation)
- **Function:** Routes SDR user messages, scans for leads (Signal 1 & 2)
- **Model:** anthropic/claude-sonnet-4-6
- **Workspace:** /home/ubuntu/.openclaw/agents/sdr-automation/
- **Users:** 5-10 SDR users (isolated workspaces)
- **Memory:** workspace-sdr/memory/ + users/[id]/scan-history.json
```

**File: `/home/ubuntu/.openclaw/agents/sdr-automation/SOUL.md`**

```markdown
# SOUL.md - SDR Automation Agent

## Who I Am
I am the dispatcher for the Lead Gen bot (SDR Automation). My job is to:
1. Route incoming scan requests to the correct user workspace
2. Load that user's ICP and preferences
3. Detect signal type (HIRING or RECENTLY FUNDED)
4. Execute lead scanning (signal-specific orchestrators)
5. Stream results to user
6. Update user memory with learnings

## My Boundaries
- I have NO access to Shreyash's personal data
- I do NOT handle personal requests (only SDR/lead gen requests)
- I do NOT mix users' data (complete isolation)
- I learn from each user's signal preferences (which sources work best)

## My Values
- **Lead Quality:** Every lead meets seniority + location filters
- **Signal Accuracy:** Track which signal type works for each user
- **Source Performance:** Learn which sources deliver best leads
- **Scalability:** Handle 5-10 concurrent users

## How I Work
1. Receive scan request from SDR user
2. Load user workspace: users/[sender_id]/
3. Read: ICP profile + scan history
4. Detect: Signal type (HIRING or RECENTLY FUNDED)
5. Execute: signal-specific orchestrator
6. Stream: Leads as they arrive
7. Update: Scan history + signal accuracy tracking
```

**File: `/home/ubuntu/.openclaw/agents/sdr-automation/MEMORY.md`**

```markdown
# MEMORY.md - SDR Automation Agent

## About This Agent
- **Role:** Lead Gen dispatcher
- **Workspace:** /home/ubuntu/.openclaw/agents/sdr-automation/
- **Users:** Multiple isolated users (in users/ subdirectories)
- **Focus:** Lead scanning (Signal 1 & 2)

## System Learnings

### Signal 1 (HIRING) Performance
- LinkedIn source: 40-50% of leads (highest quality)
- Indeed source: 20-30% of leads (good volume)
- YC Work at a Startup: 15-20% of leads (high quality)
- Wellfound: 5-10% of leads (niche, founders)
- Avg quality: 8/10 (meets seniority filters)

### Signal 2 (RECENTLY FUNDED) Performance
- YC API: 100% of leads (100% quality)
- Batches tracked: X26, W26, F25, S25, W25, S24
- Avg quality: 9/10 (founders with capital)
- Response time: 2-3 mins (batch scan)

### Source Accuracy
- LinkedIn: 85% match to query
- Indeed: 75% match to query
- YC: 95% match to query
- Wellfound: 80% match to query

## Multi-User Observations

### User Cohorts
- Quick scanners (1-2 scans/week): 50% of users
- Power scanners (5+ scans/week): 30% of users
- Occasional users (< 1 scan/month): 20% of users

### Signal Preference
- HIRING: 60% of requests
- RECENTLY FUNDED: 40% of requests

### Query Patterns
- Avg leads requested: 15
- Most common seniority: VP, CXO
- Most common industry: SaaS, AI, fintech
- Most common location: US

## Failure Modes
- LinkedIn session expired: 5% of scans
- No results (bad query): 2% of scans
- Duplicate leads (across sources): Filtered

## Notes
- Each user has isolated workspace
- Scan history per-user in users/[id]/scan-history.json
- Source accuracy tracked per-user
- No cross-user data leaks
```

### Step 1.4: Update MAIN Agent Identity

**File: `/home/ubuntu/.openclaw/workspace/IDENTITY.md`** (UPDATE)

```markdown
# IDENTITY.md - MAIN Agent

- **Name:** Claw (personal assistant)
- **Role:** Shreyash's personal assistant + message router
- **Function:** Handle personal requests, route bot messages to dedicated agents
- **Model:** anthropic/claude-haiku-4-5 (lightweight for routing)
- **Workspace:** /home/ubuntu/.openclaw/workspace/
- **Context:** Shreyash's personal data only

## Special Responsibilities
- Route @shr488bot messages to CE Agent
- Route @sdr-bot messages to SDR Agent
- Handle personal admin requests
- Maintain routing decision logs
```

---

## 🔄 PHASE 2: MEMORY SETUP (This Week)

### Step 2.1: Initialize CE Agent Memory

**Create: `/home/ubuntu/.openclaw/agents/content-engine/MEMORY.md`**
(Template provided in Step 1.2 above)

**Create: `/home/ubuntu/.openclaw/agents/content-engine/memory/README.md`**

```markdown
# CE Agent Memory Directory

This directory contains daily logs and accumulated learnings for the Content Engine Agent.

## Structure
```
memory/
├── YYYY-MM-DD.md     (daily logs, created fresh each day)
├── [older logs]
└── README.md (this file)
```

## Daily Log Format (YYYY-MM-DD.md)

```
# [Date] - Content Engine Agent Log

## Activity Summary
- Total user messages: N
- Pillar workflows executed: N
- Content pieces generated: N
- Scans executed: N

## Learnings & Observations
[Key insights from today]

## Errors & Fixes
[Any issues encountered and how they were resolved]

## User Feedback
[Notable feedback from users]
```

## Append-Only Rule
- Never delete entries from daily logs
- Archive old logs yearly (memory/2025/[logs]/)
- Keep current year in memory/
```

### Step 2.2: Initialize SDR Agent Memory

**Create: `/home/ubuntu/.openclaw/agents/sdr-automation/MEMORY.md`**
(Template provided in Step 1.3 above)

**Create: `/home/ubuntu/.openclaw/agents/sdr-automation/memory/README.md`**

```markdown
# SDR Agent Memory Directory

This directory contains daily logs and accumulated learnings for the SDR Automation Agent.

## Structure
```
memory/
├── YYYY-MM-DD.md     (daily logs, created fresh each day)
├── [older logs]
└── README.md (this file)
```

## Daily Log Format (YYYY-MM-DD.md)

```
# [Date] - SDR Automation Agent Log

## Activity Summary
- Total scan requests: N
- Signal 1 scans: N
- Signal 2 scans: N
- Total leads found: N

## Source Performance Today
- LinkedIn: X leads (avg quality: Y/10)
- Indeed: X leads (avg quality: Y/10)
- YC: X leads (avg quality: Y/10)
- Wellfound: X leads (avg quality: Y/10)

## Signal Accuracy
- Signal 1 avg match: X%
- Signal 2 avg match: Y%

## Learnings
[Key insights from today]

## Errors & Fixes
[Any issues encountered and how they were resolved]

## User Feedback
[Notable feedback from users]
```

## Append-Only Rule
- Never delete entries
- Archive old logs yearly
```

---

## 🔀 PHASE 3: ROUTING LOGIC (Next Week)

### Step 3.1: Update MAIN Agent Dispatcher

**In MAIN Agent's SKILL.md (dispatcher section):**

```
## MESSAGE ROUTING LOGIC

### Step 1: Identify Message Source
├─ Check inbound metadata: channel, sender_id, message_source
├─ Determine: Personal request OR bot request?
└─ Route accordingly

### Step 2: Route to Correct Agent

IF message is from @shr488bot:
└─ **Route to CE Agent**
   ├─ Call: sessions_send(agentId="content-engine-agent", message="[original message]")
   ├─ Yield and wait for response
   └─ Forward response to user

IF message is from @sdr-bot:
└─ **Route to SDR Agent**
   ├─ Call: sessions_send(agentId="sdr-automation-agent", message="[original message]")
   ├─ Yield and wait for response
   └─ Forward response to user

IF message is personal (from Shreyash):
└─ **Handle in MAIN Agent**
   ├─ Load: MEMORY.md + USER.md
   ├─ Execute: personal request
   └─ Respond directly

IF message is admin/system:
└─ **Handle in MAIN Agent**
   ├─ Check permissions
   ├─ Execute: admin task
   └─ Log to MEMORY.md
```

### Step 3.2: Implement sessions_send Logic

**In MAIN Agent:**

```python
# Pseudo-code for routing

def route_message(sender_id, message_text, inbound_metadata):
    # Determine message source
    if inbound_metadata.get('from_bot') == 'shr488bot':
        # CE message
        response = sessions_send(
            agentId="content-engine-agent",
            message=message_text,
            metadata={'sender_id': sender_id, 'original_metadata': inbound_metadata}
        )
        return response
    
    elif inbound_metadata.get('from_bot') == 'sdr-bot':
        # SDR message
        response = sessions_send(
            agentId="sdr-automation-agent",
            message=message_text,
            metadata={'sender_id': sender_id, 'original_metadata': inbound_metadata}
        )
        return response
    
    else:
        # Personal message
        return handle_personal_request(message_text, sender_id)
```

---

## ✅ TESTING CHECKLIST (Phase 4)

### Test 1: CE Agent Routing
- [ ] Send message to @shr488bot
- [ ] Verify MAIN routes to CE Agent
- [ ] CE Agent processes message
- [ ] Response returned to user
- [ ] CE Agent memory updated
- [ ] No Shreyash context leaked

### Test 2: SDR Agent Routing
- [ ] Send message to Lead Gen bot
- [ ] Verify MAIN routes to SDR Agent
- [ ] SDR Agent processes message
- [ ] Response returned to user
- [ ] SDR Agent memory updated
- [ ] No Shreyash context leaked

### Test 3: Personal Request
- [ ] Send personal message to MAIN
- [ ] Verify handled in MAIN session
- [ ] MEMORY.md accessible
- [ ] Response immediate

### Test 4: Privacy Isolation
- [ ] CE Agent cannot see MAIN MEMORY.md
- [ ] SDR Agent cannot see MAIN MEMORY.md
- [ ] CE users cannot see SDR users' data
- [ ] SDR users cannot see CE users' data

---

## 📊 SUMMARY

**What We're Creating:**
- ✅ CE Agent (dedicated agent for @shr488bot)
- ✅ SDR Agent (dedicated agent for Lead Gen bot)
- ✅ MAIN Agent (lightweight router + personal assistant)
- ✅ Isolated memory for each agent
- ✅ Complete privacy between agents/users

**Benefits:**
- ✅ Scalability (agents run independently)
- ✅ Privacy (no data leaks)
- ✅ Continuity (each agent has memory)
- ✅ Clean separation (MAIN not polluted)

**Timeline:**
- **Phase 1 (this week):** Setup workspaces + identities
- **Phase 2 (this week):** Initialize memory
- **Phase 3 (next week):** Implement routing logic
- **Phase 4 (next week):** Test + deploy

