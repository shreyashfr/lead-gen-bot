/**
 * Content Engine — Stripe Webhook Server
 *
 * Receives Stripe checkout.session.completed events directly (no Zapier).
 * Sends Telegram welcome message + master-doc template to the user.
 * Updates user registry in the CE workspace.
 *
 * Usage:
 *   STRIPE_WEBHOOK_SECRET=whsec_xxx node server.js
 *
 * In Stripe Dashboard:
 *   Webhooks → Add endpoint → https://your-server:3001/stripe-webhook
 *   Events to send: checkout.session.completed
 */

const http    = require('http');
const https   = require('https');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');

// ── Config ────────────────────────────────────────────────────────────────────

const PORT                  = process.env.PORT || 3001;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';  // whsec_xxx from Stripe Dashboard

const OPENCLAW_CONFIG = '/home/ubuntu/.openclaw/openclaw.json';
const CE_WORKSPACE    = '/home/ubuntu/.openclaw/workspace-ce';
const REGISTRY_PATH   = path.join(CE_WORKSPACE, 'users', 'registry.json');
const TEMPLATE_PATH   = path.join(CE_WORKSPACE, 'skills', 'onboarding', 'master-doc-template.md');
const USERS_DIR       = path.join(CE_WORKSPACE, 'users');

// ── Stripe Signature Verification ────────────────────────────────────────────

/**
 * Verifies the Stripe-Signature header.
 * Returns true if valid, false otherwise.
 */
function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!secret) {
    console.warn('[stripe] STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
    return true;
  }
  try {
    // Stripe signature format: t=timestamp,v1=signature
    const parts     = Object.fromEntries(signatureHeader.split(',').map(p => p.split('=')));
    const timestamp = parts['t'];
    const v1        = parts['v1'];
    if (!timestamp || !v1) return false;

    const signed   = `${timestamp}.${rawBody}`;
    const expected = crypto.createHmac('sha256', secret).update(signed, 'utf8').digest('hex');

    // Constant-time compare to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'));
  } catch (e) {
    console.error('[stripe] Signature verification error:', e.message);
    return false;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBotToken() {
  const raw   = fs.readFileSync(OPENCLAW_CONFIG, 'utf8');
  const cfg   = JSON.parse(raw);
  const token = cfg?.channels?.telegram?.botToken;
  if (!token || token === '__OPENCLAW_REDACTED__') {
    throw new Error('Bot token not found in openclaw.json');
  }
  return token;
}

function readRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
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
      path:     `/bot${token}/${method}`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
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
    req.write(bodyStr);
    req.end();
  });
}

function sendTelegramDocument(token, chatId, filePath, caption) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath);
    const filename    = path.basename(filePath);
    const boundary    = '----FormBoundary' + Math.random().toString(36).substr(2);

    const parts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}`,
      `--${boundary}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nMarkdown`,
    ];
    if (caption) {
      parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}`);
    }

    const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${filename}"\r\nContent-Type: text/markdown\r\n\r\n`;
    const footer     = `\r\n--${boundary}--\r\n`;

    const body = Buffer.concat([
      Buffer.from(parts.join('\r\n') + '\r\n\r\n'),
      Buffer.from(fileHeader),
      fileContent,
      Buffer.from(footer),
    ]);

    const options = {
      hostname: 'api.telegram.org',
      path:     `/bot${token}/sendDocument`,
      method:   'POST',
      headers:  {
        'Content-Type':   `multipart/form-data; boundary=${boundary}`,
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
  console.log(`[payment] telegram_id=${telegram_id}  name="${name}"  email=${email}`);

  const token = getBotToken();

  // 1. Create user workspace
  const userDir = path.join(USERS_DIR, String(telegram_id));
  fs.mkdirSync(userDir, { recursive: true });

  // 2. Save onboarding state
  fs.writeFileSync(
    path.join(userDir, 'onboarding-state.json'),
    JSON.stringify({ step: 'payment_confirmed', data: { name, email } }, null, 2)
  );

  // 3. Update registry
  const registry = readRegistry();
  registry.users = registry.users || {};
  registry.users[String(telegram_id)] = {
    name,
    email,
    workspace:           `${USERS_DIR}/${telegram_id}/`,
    payment_confirmed:   true,
    onboarding_complete: false,
    onboarding_step:     'payment_confirmed',
    joined:              today(),
  };
  writeRegistry(registry);
  console.log(`[payment] Registry updated`);

  // 4. Welcome message
  const welcome = await telegramRequest(token, 'sendMessage', {
    chat_id:    telegram_id,
    text:       `Payment confirmed! Welcome to the Content Engine, ${name} 🎉\n\nLet's build your content system. Fill in the template below and send it back as a *.txt* or *.md* file.`,
    parse_mode: 'Markdown',
  });
  console.log(`[payment] Welcome message:`, welcome.ok);

  // 5. Send master-doc template
  if (fs.existsSync(TEMPLATE_PATH)) {
    const doc = await sendTelegramDocument(
      token, telegram_id, TEMPLATE_PATH,
      '📄 Fill this in and send it back as a .txt or .md file.'
    );
    console.log(`[payment] Template sent:`, doc.ok);
  } else {
    console.warn(`[payment] Template not found at ${TEMPLATE_PATH}`);
  }
}

// ── HTTP Server ───────────────────────────────────────────────────────────────

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'content-engine-stripe-webhook' }));
    return;
  }

  // Stripe webhook endpoint
  if (req.method === 'POST' && req.url === '/stripe-webhook') {
    const rawBody  = await readRawBody(req);
    const sigHeader = req.headers['stripe-signature'];

    // Verify signature
    if (!sigHeader || !verifyStripeSignature(rawBody.toString('utf8'), sigHeader, STRIPE_WEBHOOK_SECRET)) {
      console.warn(`[stripe] Invalid signature — rejected`);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid signature' }));
      return;
    }

    let event;
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    // Respond to Stripe immediately (required — Stripe retries on timeout)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ received: true }));

    // Only handle payment completions
    if (event.type !== 'checkout.session.completed') {
      console.log(`[stripe] Ignored event type: ${event.type}`);
      return;
    }

    const session     = event.data?.object;
    const telegram_id = session?.client_reference_id;
    const name        = session?.customer_details?.name || session?.billing_details?.name || 'there';
    const email       = session?.customer_details?.email || session?.billing_details?.email || '';

    if (!telegram_id) {
      console.warn(`[stripe] checkout.session.completed missing client_reference_id — skipping`);
      return;
    }

    handlePaymentConfirmed({ telegram_id, name, email }).catch((err) => {
      console.error(`[payment] Error for ${telegram_id}:`, err.message);
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[webhook] Stripe webhook server running on port ${PORT}`);
  console.log(`[webhook] POST /stripe-webhook  →  Stripe events`);
  console.log(`[webhook] GET  /health          →  health check`);
  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn(`[webhook] ⚠️  STRIPE_WEBHOOK_SECRET not set — signature verification disabled`);
  }
});
