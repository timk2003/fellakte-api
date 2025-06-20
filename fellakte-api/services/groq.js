// services/groq.js
// Hier kann später die Groq-API angebunden werden

const fetch = require('node-fetch');

async function analyzeWithGroq(ocrText) {
  const prompt = `Extrahiere aus folgendem Text die Felder als kompaktes JSON:
- tiername
- impfstoff
- datum
- arzt
- art_des_dokuments

Text:
"""
${ocrText}
"""

Antworte ausschließlich mit einem JSON-Objekt, z.B.:
{"tiername":"Bello","impfstoff":"Nobivac SHPPiL","datum":"2024-01-01","arzt":"Dr. Müller","art_des_dokuments":"Impfpass"}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: 'Du bist ein hilfreicher Assistent für Tierdokumente.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.2,
    }),
  });

  if (!response.ok) throw new Error('Groq API Fehler');
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error('Groq Antwort konnte nicht als JSON geparst werden');
  }
}

module.exports = { analyzeWithGroq }; 