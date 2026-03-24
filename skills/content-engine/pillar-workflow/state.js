#!/usr/bin/env node
/**
 * State Management for Pillar Workflow
 * 
 * Tracks and manages workflow state across multiple executions
 * Ensures messages are sent ONLY when state transitions occur
 */

const fs = require('fs');
const path = require('path');

class PillarState {
  constructor(userWorkspace, pillarTopic) {
    this.userWorkspace = userWorkspace;
    this.pillarTopic = pillarTopic;
    this.stateFile = path.join(userWorkspace, 'pillar-state.json');
  }

  /**
   * Initialize state file for new pillar
   */
  initialize() {
    const state = {
      pillar: this.pillarTopic,
      state: 'PILLAR_RECEIVED',
      created_at: new Date().toISOString(),
      research_status: {
        reddit: 'pending',
        twitter: 'pending',
        youtube: 'pending',
        google_news: 'pending'
      },
      message_sent: {
        pillar_received: false,
        research_done: false,
        error: false
      }
    };
    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
    return state;
  }

  /**
   * Read current state
   */
  read() {
    try {
      const data = fs.readFileSync(this.stateFile, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      return null;
    }
  }

  /**
   * Update state
   */
  update(updates) {
    const state = this.read();
    if (!state) return null;
    
    const merged = { ...state, ...updates };
    fs.writeFileSync(this.stateFile, JSON.stringify(merged, null, 2));
    return merged;
  }

  /**
   * Check if message for state should be sent
   * Returns: { shouldSend: bool, message: string, nextState: string }
   */
  checkMessageState() {
    const state = this.read();
    if (!state) return null;

    // Check PILLAR_RECEIVED → send Message 1
    if (state.state === 'PILLAR_RECEIVED' && !state.message_sent.pillar_received) {
      return {
        shouldSend: true,
        messageType: 'PILLAR_RECEIVED',
        message: `🔍 Searching viral posts around "${state.pillar}" on Reddit, Twitter/X, YouTube and Google News...\n\nRetrieving top ideas and hooks. This takes 8-12 minutes — sit back and relax. 🙌`,
        nextState: 'RESEARCH_RUNNING'
      };
    }

    // Check RESEARCH_DONE → send Message 2
    if (state.state === 'RESEARCH_DONE' && !state.message_sent.research_done) {
      return {
        shouldSend: true,
        messageType: 'RESEARCH_DONE',
        message: `✅ Research done!\n\n💡 Generating 15 ideas now — matching what's trending against your voice, stories, and opinions. Give me a minute...`,
        nextState: 'IDEA_GENERATION_RUNNING'
      };
    }

    // Check ERROR → send Message 3
    if (state.state === 'ERROR' && !state.message_sent.error) {
      return {
        shouldSend: true,
        messageType: 'ERROR',
        message: `⚠️ Hit a hiccup. Try again in a moment.`,
        nextState: 'ERROR'
      };
    }

    // No message to send
    return {
      shouldSend: false,
      messageType: null,
      message: null,
      nextState: null
    };
  }

  /**
   * Mark message as sent after successful delivery
   */
  markMessageSent(messageType) {
    const state = this.read();
    if (!state) return null;

    state.message_sent[messageType.toLowerCase()] = true;
    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
    return state;
  }

  /**
   * Update scout status
   */
  updateScoutStatus(scoutName, status) {
    const state = this.read();
    if (!state) return null;

    state.research_status[scoutName] = status; // 'running', 'done', 'failed'
    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
    return state;
  }

  /**
   * Check if all scouts are done
   */
  allScoutsDone() {
    const state = this.read();
    if (!state) return false;

    const scouts = Object.values(state.research_status);
    return scouts.every(status => status === 'done' || status === 'failed');
  }

  /**
   * Check if any scout failed
   */
  anyScoutFailed() {
    const state = this.read();
    if (!state) return false;

    const scouts = Object.values(state.research_status);
    return scouts.some(status => status === 'failed');
  }

  /**
   * Transition to new state
   */
  setState(newState) {
    const state = this.read();
    if (!state) return null;

    state.state = newState;
    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
    return state;
  }

  /**
   * Transition to error state
   */
  setError(reason) {
    const state = this.read();
    if (!state) return null;

    state.state = 'ERROR';
    state.error_reason = reason;
    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
    return state;
  }
}

module.exports = PillarState;

// CLI usage for testing
if (require.main === module) {
  const command = process.argv[2];
  const workspace = process.argv[3];
  const topic = process.argv[4];

  if (!workspace || !topic) {
    console.error('Usage: node state.js <command> <workspace> <topic>');
    process.exit(1);
  }

  const stateManager = new PillarState(workspace, topic);

  switch (command) {
    case 'init':
      const initialized = stateManager.initialize();
      console.log(JSON.stringify(initialized, null, 2));
      break;

    case 'check':
      const checkResult = stateManager.checkMessageState();
      console.log(JSON.stringify(checkResult, null, 2));
      break;

    case 'read':
      const state = stateManager.read();
      console.log(JSON.stringify(state, null, 2));
      break;

    default:
      console.error('Unknown command:', command);
      process.exit(1);
  }
}
