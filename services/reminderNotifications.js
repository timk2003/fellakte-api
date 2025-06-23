const fetch = require('node-fetch');

async function sendReminderEmail(to, subject, text) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'noreply@deinedomain.de',
      to,
      subject,
      text,
    }),
  });
  if (!response.ok) throw new Error('E-Mail-Versand fehlgeschlagen');
  return await response.json();
}

async function sendWhatsAppReminder(to, message) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    }),
  });
  if (!response.ok) throw new Error('WhatsApp-Versand fehlgeschlagen');
  return await response.json();
}

module.exports = { sendReminderEmail, sendWhatsAppReminder }; 