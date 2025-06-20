const chalk = require('chalk');
const { supabaseAdmin } = require('../services/supabase');
const { getPresignedUrl } = require('../services/r2');
const fetch = require('node-fetch');

async function checkSupabase() {
  process.stdout.write('📡 Verbinde mit Supabase...');
  try {
    // Ping: Hole 1 Dokument (oder leere Tabelle)
    const { error } = await supabaseAdmin.from('documents').select('id').limit(1);
    if (error) throw error;
    process.stdout.write(chalk.green(' ✅\n'));
  } catch (e) {
    process.stdout.write(chalk.red(' ❌\n'));
    throw new Error('Supabase-Check fehlgeschlagen: ' + e.message);
  }
}

async function checkR2() {
  process.stdout.write('☁️  Verbinde mit Cloudflare R2...');
  try {
    // Test: Presigned URL generieren (Dummy-Datei)
    await getPresignedUrl('startup-check.txt', 'text/plain');
    process.stdout.write(chalk.green(' ✅\n'));
  } catch (e) {
    process.stdout.write(chalk.red(' ❌\n'));
    throw new Error('R2-Check fehlgeschlagen: ' + e.message);
  }
}

async function checkGroq() {
  process.stdout.write('🤖 Verbinde mit Groq AI...');
  try {
    // Mini-Request (Prompt: "Sag Hallo als JSON")
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'compound-beta',
        messages: [
          { role: 'user', content: 'Antworte nur mit {"hello":"world"}.' },
        ],
        max_tokens: 20,
        temperature: 0,
      }),
    });
    if (!response.ok) throw new Error('Groq API nicht erreichbar');
    const data = await response.json();
    if (!data.choices?.[0]?.message?.content.includes('hello')) throw new Error('Groq Antwort unerwartet');
    process.stdout.write(chalk.green(' ✅\n'));
  } catch (e) {
    process.stdout.write(chalk.red(' ❌\n'));
    throw new Error('Groq-Check fehlgeschlagen: ' + e.message);
  }
}

async function startupAnimation() {
  await checkSupabase();
  await checkR2();
  await checkGroq();
}

module.exports = { startupAnimation }; 