// test-api.js
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { getPresignedGetUrl } = require('./services/r2');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;
const TEST_IMAGE_PATH = process.env.TEST_IMAGE_PATH || path.join(__dirname, 'testbild.png');

async function loginAndGetJWT() {
  console.log('== Supabase Login ==');
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error('Login fehlgeschlagen: ' + (data.error_description || JSON.stringify(data)));
  }
  console.log('Login erfolgreich!');
  return data.access_token;
}

async function testPresignedUrl(JWT) {
  console.log('== Presigned URL Test ==');
  const res = await fetch(`${API_URL}/documents/presigned-url`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filename: 'testbild.png',
      mimetype: 'image/png'
    })
  });
  const data = await res.json();
  console.log(data);
  if (!data.success) throw new Error('Presigned URL Fehler: ' + data.message);
  return data.url;
}

async function uploadToPresignedUrl(url, filePath) {
  console.log('== Upload zu Presigned URL ==');
  const fileBuffer = fs.readFileSync(filePath);
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/png',
    },
    body: fileBuffer
  });
  console.log('Upload Status:', res.status, res.statusText);
  if (!res.ok) throw new Error('Upload fehlgeschlagen');
  // Die URL ohne Query-Parameter ist die fileUrl für Analyze
  return url.split('?')[0];
}

async function testAnalyze(fileUrl, JWT) {
  console.log('== Analyze Test ==');
  const res = await fetch(`${API_URL}/documents/analyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fileUrl
    })
  });
  const data = await res.json();
  console.log(data);
  if (!data.success) throw new Error('Analyze Fehler: ' + data.message);
  return data;
}

(async () => {
  try {
    // 0. Login und JWT holen
    const JWT = await loginAndGetJWT();

    // 1. Presigned URL generieren
    const presignedUrl = await testPresignedUrl(JWT);

    // 2. Testbild hochladen
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      throw new Error('Testbild nicht gefunden: ' + TEST_IMAGE_PATH);
    }
    const fileUrl = await uploadToPresignedUrl(presignedUrl, TEST_IMAGE_PATH);

    // 2b. Presigned GET-URL generieren
    const getUrl = await getPresignedGetUrl('testbild.png');

    // 3. Analyze-Endpoint testen
    await testAnalyze(getUrl, JWT);

    console.log('== Alle API-Tests erfolgreich abgeschlossen ==');
  } catch (e) {
    console.error('Fehler beim Test:', e);
    process.exit(1);
  }
})(); 