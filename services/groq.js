// services/groq.js
// Hier kann später die Groq-API angebunden werden

const fetch = require('node-fetch');

async function analyzeWithGroq(prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'compound-beta',
      messages: [
        { role: 'system', content: 'Du bist ein hilfreicher Assistent für Tiergesundheit und Futteranalyse.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
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