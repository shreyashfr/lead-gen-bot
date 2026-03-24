# Phase 2: Routing Logic Implementation

## 🔀 MESSAGE ROUTING ARCHITECTURE

The MAIN agent dispatcher now needs to detect message source and route accordingly.

---

## ⚙️ ROUTING LOGIC (Add to MAIN dispatcher/SKILL.md)

Insert this BEFORE the current message processing logic:

```
---
## 🔀 MESSAGE ROUTING — NEW (PHASE 2)

**CRITICAL: This runs FIRST on every message**

### Step 1: Identify Message Source

Check inbound metadata for message origin:

```python
def identify_message_source(inbound_metadata):
    """Identify if message is from bot or personal"""
    
    # Check metadata tags that identify bot source
    source_indicators = {
        '@shr488bot': 'content-engine',  # Content Engine bot
        '@sdr-bot': 'sdr-automation',     # Lead Gen bot
        'shr488bot': 'content-engine',
        'sdr-bot': 'sdr-automation',
    }
    
    # Check if message came from a known bot
    for indicator, agent_type in source_indicators.items():
        if indicator in str(inbound_metadata):
            return agent_type
    
    # Check sender_id to determine if known SDR user
    sender_id = inbound_metadata.get('sender_id', '')
    
    # If sender has SDR workspace → SDR request
    if os.path.exists(f'/home/ubuntu/.openclaw/workspace-sdr/users/{sender_id}/'):
        return 'sdr-automation'
    
    # If sender has CE workspace → CE request
    if os.path.exists(f'/home/ubuntu/.openclaw/workspace-ce/users/{sender_id}/'):
        return 'content-engine'
    
    # Default: Personal request
    return 'personal'
```

### Step 2: Route to Correct Agent

Based on source, route message:

```python
def route_message(source_type, sender_id, message_text, inbound_metadata):
    """Route message to correct agent"""
    
    if source_type == 'content-engine':
        # Route to CE Agent
        try:
            response = sessions_send(
                agentId="content-engine-agent",
                message=message_text,
                metadata={
                    'sender_id': sender_id,
                    'original_metadata': inbound_metadata,
                    'routed_from': 'MAIN',
                    'timestamp': datetime.now().isoformat()
                }
            )
            log_routing(sender_id, 'CE', 'success', message_text[:50])
            return response
        except Exception as e:
            log_routing(sender_id, 'CE', 'error', str(e))
            return error_response('CE Agent temporarily unavailable. Please try again.')
    
    elif source_type == 'sdr-automation':
        # Route to SDR Agent
        try:
            response = sessions_send(
                agentId="sdr-automation-agent",
                message=message_text,
                metadata={
                    'sender_id': sender_id,
                    'original_metadata': inbound_metadata,
                    'routed_from': 'MAIN',
                    'timestamp': datetime.now().isoformat()
                }
            )
            log_routing(sender_id, 'SDR', 'success', message_text[:50])
            return response
        except Exception as e:
            log_routing(sender_id, 'SDR', 'error', str(e))
            return error_response('SDR Agent temporarily unavailable. Please try again.')
    
    else:
        # Personal message - handle in MAIN (existing logic)
        log_routing(sender_id, 'MAIN', 'local', message_text[:50])
        return handle_personal_message(message_text, sender_id)

def log_routing(sender_id, agent, status, message_preview):
    """Log all routing decisions for debugging"""
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'sender_id': sender_id,
        'agent': agent,
        'status': status,
        'message_preview': message_preview
    }
    # Write to /home/ubuntu/.openclaw/workspace/logs/routing-2026-03-24.json
```

### Step 3: Decision Point

At the very beginning of message processing:

```
1. Receive inbound message
   ↓
2. Identify source (MAIN, CE, SDR?)
   ↓
3. If CE or SDR → Route via sessions_send
   ↓
4. If personal → Handle in MAIN
   ↓
5. Return response to user
```

---

## 🛡️ ERROR HANDLING

### Timeout (Agent doesn't respond)
```python
try:
    response = sessions_send(..., timeoutSeconds=60)
except TimeoutError:
    return "Request timed out. Please try again."
```

### Agent Crash
```python
except ConnectionError as e:
    log_error(f"Agent connection failed: {e}")
    return "Agent temporarily unavailable. Try again in a moment."
```

### Invalid Message
```python
except ValueError as e:
    log_error(f"Invalid message format: {e}")
    return "I couldn't process that message format."
```

### Data Loss Prevention
```python
# Always save message to backup before routing
save_message_backup(sender_id, message_text, agent_type)

# Then route
response = sessions_send(...)

# Then confirm response received
if response:
    mark_message_complete(sender_id)
else:
    # If no response: fallback
    restore_from_backup(sender_id)
```

---

## 📊 ROUTING MATRIX

| Source | Detected By | Routed To | Handler |
|--------|------------|-----------|---------|
| @shr488bot | Metadata | CE Agent | content-engine-agent |
| @sdr-bot | Metadata | SDR Agent | sdr-automation-agent |
| Personal | Default | MAIN | handle_personal_message |
| Unknown | Unknown | MAIN | handle_personal_message |

---

## ✅ IMPLEMENTATION STEPS

### Step 1: Add routing functions to SKILL.md
- identify_message_source()
- route_message()
- log_routing()

### Step 2: Modify main message processing
- Before existing logic
- Call identify_message_source()
- Call route_message()
- Return early if routed

### Step 3: Add error handling
- Try/except around sessions_send()
- Log all errors
- Return user-friendly messages

### Step 4: Add logging
- Log every routing decision
- Log every error
- Save to routing-YYYY-MM-DD.json

---

## 🧪 TESTING POINTS

### Test 1: CE Routing
```
Send: "Pillar: AI Strategy" from @shr488bot
Expected: Routes to CE Agent, CE Agent responds
Verify: CE Agent receives message, response returned
```

### Test 2: SDR Routing
```
Send: "scan: 10 VP at SaaS" from @sdr-bot
Expected: Routes to SDR Agent, SDR Agent responds
Verify: SDR Agent receives message, response returned
```

### Test 3: Personal Routing
```
Send: "What's the weather?" from personal
Expected: Handled in MAIN, MAIN responds
Verify: MAIN processes locally
```

### Test 4: Error Handling
```
Scenario: CE Agent crashes
Send: Message to @shr488bot
Expected: Error message "CE Agent temporarily unavailable"
Verify: User informed, no silent failure
```

---

## 🔄 ROLLBACK PLAN

If routing breaks:

1. Restore backup SKILL.md
```bash
cp /home/ubuntu/.openclaw/workspace/skills/dispatcher/SKILL.md.backup-2026-03-24-12-08 \
   /home/ubuntu/.openclaw/workspace/skills/dispatcher/SKILL.md
```

2. All messages route to MAIN (existing behavior)

3. Diagnose issue from logs

4. Fix and test again

---

## 📈 MONITORING AFTER DEPLOYMENT

### Metrics to Watch
- Messages routed to CE Agent: should increase
- Messages routed to SDR Agent: should increase
- Messages in MAIN: should decrease
- Errors in CE Agent: should be 0
- Errors in SDR Agent: should be 0
- Response times: should stay same

### Logs to Check
- `/home/ubuntu/.openclaw/workspace/logs/routing-*.json`
- `/home/ubuntu/.openclaw/agents/content-engine/memory/2026-03-24.md`
- `/home/ubuntu/.openclaw/agents/sdr-automation/memory/2026-03-24.md`

### What to Alert On
- Routing errors > 5%
- Timeout errors > 2
- Agent crashes
- No responses from agents

---

## 🎯 SUCCESS CRITERIA

Phase 2 is successful when:

✅ CE messages route to CE Agent
✅ SDR messages route to SDR Agent
✅ Personal messages stay in MAIN
✅ All responses returned to users
✅ No data loss
✅ Error handling works
✅ Logging works
✅ Rollback ready

