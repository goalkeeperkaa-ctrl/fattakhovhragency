const rateStore = globalThis.__leadRateStore || new Map();
globalThis.__leadRateStore = rateStore;

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

function isValidContact(value) {
  const v = String(value || '').trim();
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const telegram = /^@?[a-zA-Z0-9_]{5,32}$/;
  const phone = /^\+?[0-9\s\-()]{10,18}$/;
  return email.test(v) || telegram.test(v) || phone.test(v);
}

function getClientKey(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function hitRateLimit(key) {
  const now = Date.now();
  const bucket = (rateStore.get(key) || []).filter((ts) => now - ts < WINDOW_MS);
  bucket.push(now);
  rateStore.set(key, bucket);
  return bucket.length > MAX_REQUESTS_PER_WINDOW;
}

async function sendTelegram(botToken, chatId, text) {
  const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  return tgRes.ok;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { name, contact, source, company, formOpenedAt, submittedAt, turnstileToken } = req.body || {};

    const trimmedName = String(name || '').trim();
    const trimmedContact = String(contact || '').trim();

    if (!trimmedName || !trimmedContact) {
      return res.status(400).json({ ok: false, error: 'name and contact are required' });
    }

    if (trimmedName.length < 2 || trimmedName.length > 80) {
      return res.status(400).json({ ok: false, error: 'invalid name length' });
    }

    if (trimmedContact.length < 5 || trimmedContact.length > 120 || !isValidContact(trimmedContact)) {
      return res.status(400).json({ ok: false, error: 'invalid contact format' });
    }

    if (company && String(company).trim()) {
      return res.status(400).json({ ok: false, error: 'spam detected' });
    }

    const opened = Number(formOpenedAt || 0);
    const submitted = Number(submittedAt || Date.now());
    if (!opened || submitted - opened < 2500) {
      return res.status(429).json({ ok: false, error: 'submitted too quickly' });
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!turnstileToken) {
        return res.status(400).json({ ok: false, error: 'turnstile token required' });
      }

      const verifyResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: String(turnstileToken),
          remoteip: getClientKey(req),
        }),
      });

      const verifyData = await verifyResp.json();
      if (!verifyData?.success) {
        return res.status(400).json({ ok: false, error: 'turnstile validation failed' });
      }
    }

    const clientKey = getClientKey(req);
    if (hitRateLimit(clientKey)) {
      return res.status(429).json({ ok: false, error: 'too many requests' });
    }

    const payload = {
      name: trimmedName,
      contact: trimmedContact,
      source: source || 'website',
      createdAt: new Date().toISOString(),
    };

    const webhook = process.env.LEAD_WEBHOOK_URL;
    const botToken = process.env.TG_BOT_TOKEN;
    const chatId = process.env.TG_CHAT_ID;

    const leadText = [
      '🔔 Новая заявка с сайта',
      `Имя: ${payload.name}`,
      `Контакт: ${payload.contact}`,
      `Источник: ${payload.source}`,
      `Время: ${payload.createdAt}`,
    ].join('\n');

    if (webhook) {
      const upstream = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!upstream.ok) {
        if (botToken && chatId) {
          await sendTelegram(botToken, chatId, `⚠️ Ошибка доставки лида в webhook\nstatus: ${upstream.status}\n${leadText}`);
        }
        return res.status(502).json({ ok: false, error: 'Webhook delivery failed' });
      }

      return res.status(200).json({ ok: true });
    }

    if (botToken && chatId) {
      const ok = await sendTelegram(botToken, chatId, leadText);
      if (!ok) {
        return res.status(502).json({ ok: false, error: 'Telegram delivery failed' });
      }

      return res.status(200).json({ ok: true });
    }

    console.log('[lead] No delivery destination set. Received lead:', payload);
    return res.status(200).json({ ok: true, warning: 'No destination configured' });
  } catch (error) {
    console.error('[lead] error', error);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}
