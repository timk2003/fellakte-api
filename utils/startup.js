const chalk = require('chalk');

async function fakeWait(msg, ms = 800) {
  process.stdout.write(msg);
  await new Promise((r) => setTimeout(r, ms));
  process.stdout.write(chalk.green(' ✅\n'));
}

async function startupAnimation() {
  await fakeWait('📡 Verbinde mit Supabase...');
  await fakeWait('☁️  Verbinde mit Cloudflare R2...');
  await fakeWait('🤖 Verbinde mit Groq AI...');
}

module.exports = { startupAnimation }; 