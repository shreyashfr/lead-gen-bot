require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;
const REGISTRY_PATH = process.env.REGISTRY_PATH;
const WORKSPACE_BASE = process.env.WORKSPACE_BASE;

// ─── Basic Auth ───────────────────────────────────────────────────────────────
const DASHBOARD_PASS = process.env.DASHBOARD_PASS || 'admin2026';

app.use((req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Dashboard"');
    return res.status(401).send('Authentication required');
  }
  const [, b64] = auth.split(' ');
  const [user, pass] = Buffer.from(b64, 'base64').toString().split(':');
  if (pass !== DASHBOARD_PASS) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Dashboard"');
    return res.status(401).send('Wrong password');
  }
  next();
});

const SESSIONS_DIR = '/home/ubuntu/.openclaw/agents/main/sessions';

// ─── Data helpers ─────────────────────────────────────────────────────────────
function readRegistry() {
  try { return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')); }
  catch (e) { return { admin_ids: [], users: {} }; }
}

function readUsage(telegramId, workspace) {
  try {
    const p = path.join(workspace.replace(/\/$/, ''), 'usage.json');
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) { return null; }
}

function readOnboardingState(workspace) {
  try {
    const p = path.join(workspace.replace(/\/$/, ''), 'onboarding-state.json');
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) { return null; }
}

function getUserMessages(telegramId, limit = 30) {
  try {
    // Check main sessions first, fall back to legacy CE sessions
    const FALLBACK_SESSIONS_DIR = '/home/ubuntu/.openclaw/agents/ce/sessions';
    let userSession = null;
    let resolvedSessionsDir = SESSIONS_DIR;

    for (const dir of [SESSIONS_DIR, FALLBACK_SESSIONS_DIR]) {
      const sessionsFile = path.join(dir, 'sessions.json');
      if (!fs.existsSync(sessionsFile)) continue;
      const data = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
      const sessions = Array.isArray(data) ? data : Object.values(data);
      const found = sessions.find(s =>
        s.origin?.from === `telegram:${telegramId}` ||
        (s.origin?.label || '').includes(telegramId)
      );
      if (found) { userSession = found; resolvedSessionsDir = dir; break; }
    }
    if (!userSession) return [];

    // Find the session file — check plain .jsonl first, then most recent reset file
    let jsonlFile = path.join(resolvedSessionsDir, `${userSession.sessionId}.jsonl`);
    if (!fs.existsSync(jsonlFile)) {
      const resetFiles = fs.readdirSync(resolvedSessionsDir)
        .filter(f => f.startsWith(userSession.sessionId) && f.includes('.reset.'))
        .sort().reverse();
      if (resetFiles.length) jsonlFile = path.join(resolvedSessionsDir, resetFiles[0]);
      else return [];
    }
    const lines = fs.readFileSync(jsonlFile, 'utf8').trim().split('\n');
    const messages = [];

    for (const line of lines.slice(-100)) {
      try {
        const obj = JSON.parse(line);
        if (obj.type !== 'message') continue;
        const msg = obj.message;
        const role = msg?.role;
        if (role !== 'user' && role !== 'assistant') continue;

        // Only grab plain text content — skip tool calls, tool results, thinking
        const textParts = Array.isArray(msg?.content)
          ? msg.content.filter(c => c.type === 'text').map(c => c.text)
          : [];
        if (!textParts.length) continue;

        const rawText = textParts.join('').trim();

        // Skip internal system events / sub-agent completion events
        if (rawText.includes('OpenClaw runtime context') ||
            rawText.includes('subagent task') ||
            rawText.includes('completed subagent') ||
            rawText.includes('BEGIN_UNTRUSTED_CHILD_RESULT') ||
            rawText === 'NO_REPLY') continue;

        // For user messages: strip the metadata envelope (everything up to and including the ``` blocks)
        let clean = rawText;
        if (role === 'user') {
          // Remove Conversation info / Sender metadata blocks
          clean = rawText.replace(/^[\s\S]*?```json[\s\S]*?```\s*/gm, '').trim();
          // Remove any remaining leading JSON-looking lines
          clean = clean.replace(/^(Conversation info|Sender)[\s\S]*?\n\n/gm, '').trim();
        }

        // Format timestamp in IST
        const utcDate = new Date(obj.timestamp);
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(utcDate.getTime() + istOffset);
        const istStr = istDate.toISOString().replace('T', ' ').substring(0, 16) + ' IST';
        if (clean) messages.push({ role, text: clean.substring(0, 800), ts: istStr });
      } catch (e) {}
    }
    return messages.slice(-limit).reverse();
  } catch (e) { return []; }
}

function getWebhookStatus() {
  try {
    const { execSync } = require('child_process');
    const result = execSync('curl -s --max-time 2 http://localhost:3001/health').toString();
    const json = JSON.parse(result);
    return { running: json.status === 'ok', pid: null };
  } catch (e) { return { running: false, pid: null }; }
}

// ─── Dashboard HTML ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  const registry = readRegistry();
  const users = registry.users || {};
  const totalUsers = Object.keys(users).length;
  const paidUsers = Object.values(users).filter(u => u.payment_confirmed === true).length;
  const onboardedUsers = Object.values(users).filter(u => u.onboarding_complete === true).length;
  const webhookStatus = getWebhookStatus();

  const userRows = Object.entries(users).map(([id, user]) => {
    const usage = readUsage(id, user.workspace || '');
    const state = readOnboardingState(user.workspace || '');
    const paidBadge = user.payment_confirmed
      ? `<span class="badge green">✅ Paid</span>`
      : `<span class="badge red">❌ Unpaid</span>`;
    const onboardBadge = user.onboarding_complete
      ? `<span class="badge green">✅ Done</span>`
      : `<span class="badge yellow">⏳ ${user.onboarding_step || 'pending'}</span>`;
    const pillars = usage?.pillar_runs?.count ?? '—';
    const scans = usage?.competitive_scans?.count ?? '—';
    const messages = usage?.messages?.count ?? '—';

    return `
      <tr>
        <td><a href="/user/${id}" style="color:#fff;text-decoration:none"><strong>${user.name || '—'}</strong></a><br><small style="color:#888">${id}</small></td>
        <td>${user.email || '—'}</td>
        <td>${paidBadge}</td>
        <td>${onboardBadge}</td>
        <td>${user.joined || '—'}</td>
        <td>${user.niche || '—'}</td>
        <td class="center">${pillars}/3</td>
        <td class="center">${scans}/2</td>
        <td class="center">${messages}/15</td>
        <td>${user.subscription_start || '—'}</td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Engine — Admin Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f0f; color: #e0e0e0; }
    .header { background: #1a1a1a; border-bottom: 1px solid #333; padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; }
    .header h1 { font-size: 20px; font-weight: 600; color: #fff; }
    .header .status { font-size: 13px; color: #888; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 24px 32px; }
    .stat { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 10px; padding: 20px; }
    .stat .label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .stat .value { font-size: 32px; font-weight: 700; color: #fff; }
    .stat .sub { font-size: 12px; color: #555; margin-top: 4px; }
    .section { padding: 0 32px 32px; }
    .section h2 { font-size: 15px; font-weight: 600; color: #aaa; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; background: #1a1a1a; border-radius: 10px; overflow: hidden; border: 1px solid #2a2a2a; }
    th { background: #222; padding: 12px 16px; text-align: left; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    td { padding: 14px 16px; border-top: 1px solid #242424; font-size: 13px; vertical-align: middle; }
    td.center { text-align: center; }
    tr:hover td { background: #1e1e1e; }
    .badge { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge.green { background: #0d2e1a; color: #4ade80; }
    .badge.red { background: #2e0d0d; color: #f87171; }
    .badge.yellow { background: #2e2a0d; color: #facc15; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }
    .dot.green { background: #4ade80; }
    .dot.red { background: #f87171; }
    .refresh { background: #2a2a2a; color: #888; border: 1px solid #333; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; text-decoration: none; }
    .refresh:hover { background: #333; color: #fff; }
  </style>
  <meta http-equiv="refresh" content="30">
</head>
<body>
  <div class="header">
    <h1>🤖 Content Engine — Admin Dashboard</h1>
    <div style="display:flex;align-items:center;gap:16px">
      <span class="status">
        <span class="dot ${webhookStatus.running ? 'green' : 'red'}"></span>
        Webhook server ${webhookStatus.running ? 'running' : 'DOWN'}
      </span>
      <span class="status">Auto-refreshes every 30s</span>
      <a href="/" class="refresh">↻ Refresh</a>
    </div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="label">Total Users</div>
      <div class="value">${totalUsers}</div>
      <div class="sub">All time</div>
    </div>
    <div class="stat">
      <div class="label">Paying Users</div>
      <div class="value">${paidUsers}</div>
      <div class="sub">${totalUsers - paidUsers} unpaid</div>
    </div>
    <div class="stat">
      <div class="label">Fully Onboarded</div>
      <div class="value">${onboardedUsers}</div>
      <div class="sub">of ${paidUsers} paid</div>
    </div>
    <div class="stat">
      <div class="label">Monthly Revenue</div>
      <div class="value">₹${(paidUsers * 5000).toLocaleString()}</div>
      <div class="sub">@ ₹5,000/user</div>
    </div>
  </div>

  <div class="section">
    <h2>Users</h2>
    <table>
      <thead>
        <tr>
          <th>Name / ID</th>
          <th>Email</th>
          <th>Payment</th>
          <th>Onboarding</th>
          <th>Joined</th>
          <th>Niche</th>
          <th>Pillars Today</th>
          <th>Scans Today</th>
          <th>Msgs/hr</th>
          <th>Sub Start</th>
        </tr>
      </thead>
      <tbody>
        ${userRows || '<tr><td colspan="10" style="text-align:center;color:#555;padding:40px">No users yet</td></tr>'}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  res.send(html);
});

// ─── User detail page ─────────────────────────────────────────────────────────
app.get('/user/:id', (req, res) => {
  const telegramId = req.params.id;
  const registry = readRegistry();
  const user = registry.users[telegramId];
  if (!user) return res.status(404).send('User not found');

  const messages = getUserMessages(telegramId, 50);
  const usage = readUsage(telegramId, user.workspace || '');

  const messageHtml = messages.length === 0
    ? '<p style="color:#555;text-align:center;padding:40px">No messages found</p>'
    : messages.map(m => {
        const isUser = m.role === 'user';
        const bg = isUser ? '#1a2a1a' : '#1a1a2a';
        const label = isUser ? '👤 User' : '🤖 Bot';
        const color = isUser ? '#4ade80' : '#60a5fa';
        return `
          <div style="background:${bg};border:1px solid #2a2a2a;border-radius:8px;padding:14px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:${color};font-size:12px;font-weight:600">${label}</span>
              <span style="color:#555;font-size:11px">${m.ts}</span>
            </div>
            <div style="font-size:13px;color:#ddd;white-space:pre-wrap;word-break:break-word">${m.text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
          </div>`;
      }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${user.name || telegramId} — Messages</title>
  <style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f0f0f;color:#e0e0e0; }
    .header { background:#1a1a1a;border-bottom:1px solid #333;padding:20px 32px;display:flex;align-items:center;justify-content:space-between; }
    .header h1 { font-size:18px;font-weight:600;color:#fff; }
    .back { background:#2a2a2a;color:#888;border:1px solid #333;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px; }
    .back:hover { background:#333;color:#fff; }
    .info { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:24px 32px; }
    .stat { background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:16px; }
    .stat .label { font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px; }
    .stat .value { font-size:18px;font-weight:700;color:#fff; }
    .section { padding:0 32px 32px; }
    .section h2 { font-size:14px;font-weight:600;color:#aaa;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.5px; }
    .badge { padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600; }
    .badge.green { background:#0d2e1a;color:#4ade80; }
    .badge.red { background:#2e0d0d;color:#f87171; }
  </style>
</head>
<body>
  <div class="header">
    <h1>💬 ${user.name || telegramId}</h1>
    <a href="/" class="back">← Back to Dashboard</a>
  </div>
  <div class="info">
    <div class="stat"><div class="label">Payment</div><div class="value">${user.payment_confirmed ? '<span class="badge green">✅ Paid</span>' : '<span class="badge red">❌ Unpaid</span>'}</div></div>
    <div class="stat"><div class="label">Joined</div><div class="value">${user.joined || '—'}</div></div>
    <div class="stat"><div class="label">Niche</div><div class="value" style="font-size:13px">${user.niche || '—'}</div></div>
    <div class="stat"><div class="label">Email</div><div class="value" style="font-size:13px">${user.email || '—'}</div></div>
    <div class="stat"><div class="label">Pillars Today</div><div class="value">${usage?.pillar_runs?.count ?? 0}/3</div></div>
    <div class="stat"><div class="label">Scans Today</div><div class="value">${usage?.competitive_scans?.count ?? 0}/2</div></div>
    <div class="stat"><div class="label">Messages/hr</div><div class="value">${usage?.messages?.count ?? 0}/15</div></div>
    <div class="stat"><div class="label">Sub Start</div><div class="value" style="font-size:13px">${user.subscription_start || '—'}</div></div>
  </div>
  <div class="section">
    <h2>Last 50 Messages</h2>
    ${messageHtml}
  </div>
</body>
</html>`;

  res.send(html);
});

app.listen(PORT, () => {
  console.log(`📊 Admin dashboard running on port ${PORT}`);
});
