/**
 * Content Engine — Payment Webhook Server
 *
 * Receives Zapier POST after Stripe payment completes.
 * Sends Telegram welcome message + master-doc template.
 * Updates user registry in the CE workspace.
 *
 * Usage:
 *   PAYMENT_WEBHOOK_SECRET=your-secret STRIPE_PAYMENT_LINK=https://buy.stripe.com/xxx node server.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'change-me-please';

const OPENCLAW_CONFIG = '/home/ubuntu/.openclaw/openclaw.json';
const CE_WORKSPACE   = '/home/ubuntu/.openclaw/workspace-ce';
const REGISTRY_PATH  = path.join(CE_WORKSPACE, 'users', 'registry.json');
const TEMPLATE_PATH  = path.join(CE_WORKSPACE, 'skills', 'onboarding', 'master-doc-template.md');
const USERS_DIR      = path.join(CE_WORKSPACE, 'users');

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBotToken() {
  const raw = fs.readFileSync(OPENCLAW_CONFIG, 'utf8');
  const cfg = JSON.parse(raw);
  const token = cfg?.channels?.telegram?.botToken;
  if (!token || token === '__OPENCLAW_REDACTED__') {
    throw new Error('Bot token not found or redacted in openclaw.json');
  }
  return token;
}

function readRegistry() {
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
  return JSON.parse(raw);
}

function writeRegistry(data) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// ── Telegram API ──────────────────────────────────────────────────────────────

function telegramRequest(token, method, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve({ ok: false, raw: data }); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

/**
 * Send a document (file) via Telegram Bot API using multipart/form-data.
 */
function sendTelegramDocument(token, chatId, filePath, caption) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath);
    const filename    = path.basename(filePath);
    const boundary    = '----FormBoundary' + Math.random().toString(36).substr(2);

    const parts = [];

    // chat_id field
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}`
    );

    // caption field
    if (caption) {
      parts.push(
        `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}`
      );
    }

    // parse_mode
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nMarkdown`
    );

    const headerStr = parts.join('\r\n') + '\r\n';
    const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${filename}"\r\nContent-Type: text/markdown\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;

    const body = Buffer.concat([
      Buffer.from(headerStr + '\r\n'),
      Buffer.from(fileHeader),
      fileContent,
      Buffer.from(footer),
    ]);

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendDocument`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve({ ok: false, raw: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Core Payment Handler ──────────────────────────────────────────────────────

async function handlePaymentConfirmed({ telegram_id, name, email }) {
  console.log(`[payment] Processing: telegram_id=${telegram_id} name="${name}" email=${email}`);

  const token = getBotToken();

  // 1. Create user workspace dir
  const userDir = path.join(USERS_DIR, String(telegram_id));
  fs.mkdirSync(userDir, { recursive: true });

  // 2. Write onboarding-state.json
  const state = {
    step: 'payment_confirmed',
    data: { name, email },
  };
  fs.writeFileSync(path.join(userDir, 'onboarding-state.json'), JSON.stringify(state, null, 2));

  // 3. Update registry
  const registry = readRegistry();
  registry.users = registry.users || {};
  registry.users[String(telegram_id)] = {
    name,
    email,
    workspace: `${USERS_DIR}/${telegram_id}/`,
    payment_confirmed: true,
    onboarding_complete: false,
    onboarding_step: 'payment_confirmed',
    joined: today(),
  };
  writeRegistry(registry);

  console.log(`[payment] Registry updated for ${telegram_id}`);

  // 4. Send welcome message
  const welcomeMsg = await telegramRequest(token, 'sendMessage', {
    chat_id: telegram_id,
    text: `Welcome to the Content Engine, ${name}! 🎉\n\nYour payment is confirmed. Let's build your content system.\n\nTo get started, fill in the template I'm about to send and return it as a *.txt* or *.md* file.`,
    parse_mode: 'Markdown',
  });
  console.log(`[payment] Welcome message sent:`, welcomeMsg.ok);

  // 5. Send master-doc template
  if (fs.existsSync(TEMPLATE_PATH)) {
    const docResult = await sendTelegramDocument(
      token,
      telegram_id,
      TEMPLATE_PATH,
      '📄 Fill this in and send it back as a .txt or .md file.'
    );
    console.log(`[payment] Template sent:`, docResult.ok);
  } else {
    console.warn(`[payment] Template not found at ${TEMPLATE_PATH} — skipping file send`);
    await telegramRequest(token, 'sendMessage', {
      chat_id: telegram_id,
      text: `I'll send you the Master Doc template shortly. If you don't receive it in 5 minutes, message me with: *resend template*`,
      parse_mode: 'Markdown',
    });
  }

  console.log(`[payment] Done for ${telegram_id}`);
}

// ── HTTP Server ───────────────────────────────────────────────────────────────

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch (e) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'content-engine-payment-webhook' }));
    return;
  }

  // Payment webhook endpoint
  if (req.method === 'POST' && req.url === '/payment') {
    let body;
    try {
      body = await parseBody(req);
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      return;
    }

    // Validate secret
    if (body.secret !== WEBHOOK_SECRET) {
      console.warn(`[webhook] Invalid secret from ${req.socket.remoteAddress}`);
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    const { telegram_id, name, email } = body;

    if (!telegram_id || !name || !email) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing required fields: telegram_id, name, email' }));
      return;
    }

    // Respond immediately (Zapier expects fast response)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, message: 'Payment received, processing...' }));

    // Process async
    handlePaymentConfirmed({ telegram_id, name, email }).catch((err) => {
      console.error(`[payment] Error processing payment for ${telegram_id}:`, err.message);
    });

    return;
  }

  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[webhook] Content Engine payment webhook running on port ${PORT}`);
  console.log(`[webhook] POST /payment  →  accepts Zapier payment events`);
  console.log(`[webhook] GET  /health   →  health check`);
});
