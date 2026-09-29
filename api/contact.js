export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.status(200).json({ available: Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO && process.env.CONTACT_FROM) });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { name, phone, email, message, website } = req.body || {};
  if (website) return res.status(200).json({ ok: true });
  if (!name || !phone || !message || String(name).length > 120 || String(phone).length > 60 || String(message).length > 3000 || String(email || '').length > 254) return res.status(400).json({ error: 'Please complete the required fields.' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO || !process.env.CONTACT_FROM) return res.status(503).json({ error: 'The form is temporarily unavailable. Please call (704) 840-2555.' });
  const clean = v => String(v || '').replace(/[<>\r\n]/g, ' ').trim();
  try {
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.CONTACT_FROM, to: [process.env.CONTACT_TO], subject: `A-1 Lion inquiry from ${clean(name)}`, text: `Name: ${clean(name)}\nPhone: ${clean(phone)}\nEmail: ${clean(email)}\n\n${clean(message)}` }) });
    if (!response.ok) return res.status(502).json({ error: 'Could not send your message. Please call (704) 840-2555.' });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'Could not send your message. Please call (704) 840-2555.' });
  }
}
