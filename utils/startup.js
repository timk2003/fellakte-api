const chalk = require('chalk');
const { getPresignedUrl } = require('../services/r2');
const fetch = require('node-fetch');

async function checkR2() {
  process.stdout.write('☁️  Verbinde mit R2...');
  try {
    await getPresignedUrl('test.txt', 'text/plain');
    process.stdout.write(chalk.green(' ✅\n'));
  } catch (e) {
    process.stdout.write(chalk.red(' ❌\n'));
    throw new Error('R2-Check fehlgeschlagen: ' + e.message);
  }
}

async function checkGroq() {
  process.stdout.write('🤖 Verbinde mit Groq...');
  try {
    // Dummy-Request an Groq
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
    });
    if (!res.ok) throw new Error('Groq API nicht erreichbar');
    process.stdout.write(chalk.green(' ✅\n'));
  } catch (e) {
    process.stdout.write(chalk.red(' ❌\n'));
    throw new Error('Groq-Check fehlgeschlagen: ' + e.message);
  }
}

async function startupAnimation() {
  await checkR2();
  await checkGroq();
}

module.exports = { startupAnimation }; 
module.exports = { startupAnimation }; 