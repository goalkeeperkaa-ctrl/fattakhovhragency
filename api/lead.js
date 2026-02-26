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
    } else {
      console.log('[lead] LEAD_WEBHOOK_URL is not set; received lead:', payload);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[lead] error', error);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}
