export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { name, contact, source } = req.body || {};

    if (!name || !contact) {
      return res.status(400).json({ ok: false, error: 'name and contact are required' });
    }

    const payload = {
      name: String(name).trim(),
      contact: String(contact).trim(),
      source: source || 'website',
      createdAt: new Date().toISOString(),
    };

    const webhook = process.env.LEAD_WEBHOOK_URL;

    if (webhook) {
      const upstream = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!upstream.ok) {
        return res.status(502).json({ ok: false, error: 'Webhook delivery failed' });
      }

      return res.status(200).json({ ok: true });
    }

    const botToken = process.env.TG_BOT_TOKEN;
    const chatId = process.env.TG_CHAT_ID;

    if (botToken && chatId) {
      const text = [
        '🔔 Новая заявка с сайта',
        `Имя: ${payload.name}`,
        `Контакт: ${payload.contact}`,
        `Источник: ${payload.source}`,
        `Время: ${payload.createdAt}`,
      ].join('\n');

      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      });

      if (!tgRes.ok) {
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
