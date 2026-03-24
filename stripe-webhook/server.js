require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Telegram helpers ─────────────────────────────────────────────────────────
function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const body = JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', disable_web_page_preview: true });
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sendTelegramDocument(chatId, filePath, caption) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const FormData = require('form-data');
  const form = new FormData();
  form.append('chat_id', String(chatId));
  form.append('document', fs.createReadStream(filePath), { filename: path.basename(filePath) });
  if (caption) form.append('caption', caption);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendDocument`,
      method: 'POST',
      headers: form.getHeaders()
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    form.pipe(req);
  });
}

// ─── Registry helpers ─────────────────────────────────────────────────────────
function readRegistry() {
  return JSON.parse(fs.readFileSync(process.env.REGISTRY_PATH, 'utf8'));
}

function writeRegistry(registry) {
  fs.writeFileSync(process.env.REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

// Find telegram_id by stripe customer_id
function findUserByCustomerId(customerId) {
  const registry = readRegistry();
  for (const [telegramId, user] of Object.entries(registry.users || {})) {
    if (user.stripe_customer_id === customerId) {
      return { telegramId, user };
    }
  }
  return null;
}

// ─── Session reset helper ─────────────────────────────────────────────────────
// When payment is confirmed, the main agent's session may have stale cached context
// (e.g. it read payment_confirmed: false before the webhook fired). Reset the session
// so the next message starts fresh and reads the updated registry.
function resetCeSession(telegramId) {
  const sessionsPath = '/home/ubuntu/.openclaw/agents/main/sessions';
  const sessionsFile = path.join(sessionsPath, 'sessions.json');
  try {
    if (!fs.existsSync(sessionsFile)) return;
    const sessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
    const sessionKey = `agent:main:telegram:direct:${telegramId}`;
    const sessionEntry = sessions[sessionKey];

    if (sessionEntry && sessionEntry.sessionId) {
      // Rename the JSONL file to break the stale context
      const sessionFile = path.join(sessionsPath, `${sessionEntry.sessionId}.jsonl`);
      if (fs.existsSync(sessionFile)) {
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '.000Z');
        fs.renameSync(sessionFile, `${sessionFile}.reset.${timestamp}`);
        console.log(`🔄 Session reset for ${telegramId} (stale payment state cleared)`);
      }
      // Remove the session entry so the next message creates a completely fresh session
      delete sessions[sessionKey];
      fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2));
      console.log(`🗑️  Session entry removed from sessions.json for ${telegramId}`);
    } else {
      console.log(`ℹ️  No existing session for ${telegramId} — will start fresh on next message`);
    }
  } catch (err) {
    console.error(`⚠️  Could not reset session for ${telegramId}:`, err.message);
  }
}

function createUserWorkspace(telegramId, name, email) {
  const workspacePath = path.join(process.env.WORKSPACE_BASE, String(telegramId));
  fs.mkdirSync(workspacePath, { recursive: true });
  fs.writeFileSync(path.join(workspacePath, 'onboarding-state.json'), JSON.stringify({
    step: 'payment_confirmed',
    data: { name, email, telegram_id: telegramId }
  }, null, 2));

  // Create usage.json for rate limiting
  const now = new Date().toISOString();
  const today = now.split('T')[0];
  fs.writeFileSync(path.join(workspacePath, 'usage.json'), JSON.stringify({
    messages: { count: 0, window_start: now },
    pillar_runs: { count: 0, window_start: today },
    competitive_scans: { count: 0, window_start: today }
  }, null, 2));

  return workspacePath + '/';
}

// ─── Stripe Webhook ───────────────────────────────────────────────────────────
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📩 Event received: ${event.type}`);

  // ── PAYMENT CONFIRMED ──────────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const telegramId = session.client_reference_id;
    const email = session.customer_details?.email || '';
    const name = session.customer_details?.name || 'there';
    const customerId = session.customer;

    if (!telegramId) {
      console.error('❌ No client_reference_id — cannot link to Telegram user');
      return res.json({ received: true });
    }

    try {
      const workspacePath = createUserWorkspace(telegramId, name, email);

      const registry = readRegistry();
      const alreadyOnboarded = registry.users[telegramId]?.onboarding_complete || false;
      registry.users[telegramId] = {
        ...(registry.users[telegramId] || {}),
        name,
        email,
        stripe_customer_id: customerId,
        workspace: workspacePath,
        payment_confirmed: true,
        subscription_start: new Date().toISOString().split('T')[0],
        onboarding_complete: alreadyOnboarded,
        onboarding_step: alreadyOnboarded ? null : 'awaiting_master_doc',
        joined: registry.users[telegramId]?.joined || new Date().toISOString().split('T')[0]
      };
      writeRegistry(registry);

      // Also update onboarding-state.json to match
      if (!alreadyOnboarded) {
        const onboardingStatePath = path.join(workspacePath, 'onboarding-state.json');
        fs.writeFileSync(onboardingStatePath, JSON.stringify({
          step: 'awaiting_master_doc',
          data: { name, email, telegram_id: telegramId }
        }, null, 2));
      }

      // Reset any stale CE session so the bot doesn't use cached payment_confirmed: false
      resetCeSession(telegramId);

      const firstName = name.split(' ')[0];

      // Send payment confirmation message
      await sendTelegramMessage(telegramId,
        `✅ *Payment confirmed, ${firstName}!*\n\nWelcome to the Content Engine 🎉\n\nYour workspace is ready. To build your content system, fill in the attached Master Doc template and send it back as a .txt or .md file.\n\nThis is what tells the engine your voice, niche, writing rules, and stories — it's the foundation of everything.\n\n💬 *Optional but powerful* — you can also export your WhatsApp chats and send them as a .txt or .md file. I'll study how you naturally write and talk, and use that to make your content sound even more like you.`
      );

      // Send the master doc template file directly
      const templatePath = '/home/ubuntu/.openclaw/workspace/skills/onboarding/master-doc-template.md';
      if (fs.existsSync(templatePath)) {
        await sendTelegramDocument(telegramId, templatePath, 'Fill this in and send it back as a .txt or .md file ✏️');
        console.log(`📄 Master doc template sent to ${telegramId}`);
      } else {
        console.error(`⚠️  Template not found at ${templatePath}`);
      }

      console.log(`✅ Payment confirmed for ${telegramId} (${name})`);
    } catch (err) {
      console.error('❌ Error processing payment:', err);
    }
  }

  // ── SUBSCRIPTION RENEWED SUCCESSFULLY ─────────────────────────────────────
  else if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    // Only handle subscription renewals (not the initial payment)
    if (invoice.billing_reason !== 'subscription_cycle') {
      return res.json({ received: true });
    }

    const customerId = invoice.customer;
    const result = findUserByCustomerId(customerId);

    if (!result) {
      console.log(`⚠️  No user found for customer ${customerId}`);
      return res.json({ received: true });
    }

    const { telegramId, user } = result;
    const registry = readRegistry();
    registry.users[telegramId].payment_confirmed = true;
    registry.users[telegramId].subscription_start = new Date().toISOString().split('T')[0];
    writeRegistry(registry);

    const firstName = (user.name || 'there').split(' ')[0];
    await sendTelegramMessage(telegramId,
      `✅ *Subscription renewed, ${firstName}!*\n\nYou're all set for another month. Keep creating 🚀`
    );

    console.log(`✅ Subscription renewed for ${telegramId}`);
  }

  // ── PAYMENT FAILED (renewal) ───────────────────────────────────────────────
  else if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    const customerId = invoice.customer;
    const result = findUserByCustomerId(customerId);

    if (!result) {
      console.log(`⚠️  No user found for customer ${customerId}`);
      return res.json({ received: true });
    }

    const { telegramId, user } = result;
    const registry = readRegistry();
    registry.users[telegramId].payment_confirmed = false;
    registry.users[telegramId].onboarding_step = 'awaiting_payment';
    writeRegistry(registry);

    const firstName = (user.name || 'there').split(' ')[0];
    const paymentLink = `${process.env.STRIPE_PAYMENT_LINK}?client_reference_id=${telegramId}`;

    await sendTelegramMessage(telegramId,
      `⚠️ *Payment failed, ${firstName}.*\n\nYour subscription renewal didn't go through — your access has been paused.\n\nPlease update your payment method or subscribe again:\n${paymentLink}\n\nNeed help? Contact: shreyash.chavan2016@gmail.com`
    );

    console.log(`❌ Payment failed — access revoked for ${telegramId}`);
  }

  // ── SUBSCRIPTION CANCELLED ─────────────────────────────────────────────────
  else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    const result = findUserByCustomerId(customerId);

    if (!result) {
      console.log(`⚠️  No user found for customer ${customerId}`);
      return res.json({ received: true });
    }

    const { telegramId, user } = result;
    const registry = readRegistry();
    registry.users[telegramId].payment_confirmed = false;
    registry.users[telegramId].onboarding_step = 'awaiting_payment';
    writeRegistry(registry);

    const firstName = (user.name || 'there').split(' ')[0];
    const paymentLink = `${process.env.STRIPE_PAYMENT_LINK}?client_reference_id=${telegramId}`;

    await sendTelegramMessage(telegramId,
      `👋 *Your subscription has ended, ${firstName}.*\n\nYour access to the Content Engine has been paused.\n\nWant to continue? Subscribe again here:\n${paymentLink}\n\nYour content and workspace are saved — pick up right where you left off.`
    );

    console.log(`🔴 Subscription cancelled — access revoked for ${telegramId}`);
  }

  res.json({ received: true });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Stripe webhook server running on port ${PORT}`);
});
