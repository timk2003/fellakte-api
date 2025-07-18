// test-api.js
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { getPresignedUrl, getPresignedGetUrl } = require('./services/r2');

// Firebase Login für Test-User
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function loginAndGetJWT() {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    process.env.TEST_EMAIL,
    process.env.TEST_PASSWORD
  );
  const token = await userCredential.user.getIdToken();
  return token;
}

const API_URL = process.env.API_URL || 'http://127.0.0.1:3000/api';
const TEST_IMAGE_PATH = process.env.TEST_IMAGE_PATH || path.join(__dirname, 'testbild.png');

let createdPetId = null;
let createdMedicationId = null;
let createdReminderId = null;

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

async function testCreatePet(JWT) {
  console.log('== Haustier anlegen ==');
  const res = await fetch(`${API_URL}/pets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Bello',
      species: 'dog',
      breed: 'Labrador',
      birth_date: '2020-01-01',
      gender: 'male',
      color: 'schwarz',
      weight: 25,
      microchip: '1234567890',
      notes: 'Testhund',
      last_vaccination: '2024-01-01',
      avatar_url: null
    })
  });
  const data = await res.json();
  console.log(data);
  if (!data.success) throw new Error('Haustier anlegen fehlgeschlagen: ' + data.message);
  return data.data.id;
}

async function testCreateMedication(JWT, petId) {
  console.log('== Medikation anlegen ==');
  const res = await fetch(`${API_URL}/medications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pet_id: petId,
      name: 'Antibiotikum',
      dosage: '1 Tablette',
      frequency: 'daily',
      start_date: '2024-06-20',
      end_date: '2024-06-27',
      notes: 'Mit Futter geben',
      reminder: true,
      reminder_times: ['morning'],
      status: 'active',
      therapy_type: 'medication'
    })
  });
  const data = await res.json();
  console.log(data);
  if (!data.success) throw new Error('Medikation anlegen fehlgeschlagen: ' + data.message);
  return data.data.id;
}

async function testCreateReminder(JWT, petId, medicationId) {
  console.log('== Erinnerung anlegen ==');
  const res = await fetch(`${API_URL}/reminders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pet_id: petId,
      title: 'Medikamentengabe',
      description: 'Antibiotikum geben',
      reminder_date: '2024-06-21',
      reminder_time: '08:00',
      reminder_type: 'medication',
      reminder_frequency: 'daily',
      reminder_times: ['morning'],
      status: 'pending',
      email_notification: true,
      sms_notification: false,
      medication_id: medicationId
    })
  });
  const data = await res.json();
  console.log(data);
  if (!data.success) throw new Error('Erinnerung anlegen fehlgeschlagen: ' + data.message);
  return data.data.id;
}

async function testGetPets(JWT) {
  console.log('== Eigene Haustiere abfragen ==');
  const res = await fetch(`${API_URL}/pets`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${JWT}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  console.log(data);
  if (!data.success) throw new Error('Haustiere abfragen fehlgeschlagen: ' + data.message);
  return data.data;
}

async function cleanup(JWT) {
  console.log('== Cleanup: Testdaten löschen ==');
  // Erinnerung löschen
  if (createdReminderId) {
    try {
      const res = await fetch(`${API_URL}/reminders/${createdReminderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${JWT}` }
      });
      const data = await res.json();
      console.log('Erinnerung gelöscht:', data.success);
    } catch (e) { console.log('Fehler beim Löschen der Erinnerung:', e.message); }
  }
  // Medikation löschen
  if (createdMedicationId) {
    try {
      const res = await fetch(`${API_URL}/medications/${createdMedicationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${JWT}` }
      });
      const data = await res.json();
      console.log('Medikation gelöscht:', data.success);
    } catch (e) { console.log('Fehler beim Löschen der Medikation:', e.message); }
  }
  // Haustier löschen
  if (createdPetId) {
    try {
      const res = await fetch(`${API_URL}/pets/${createdPetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${JWT}` }
      });
      const data = await res.json();
      console.log('Haustier gelöscht:', data.success);
    } catch (e) { console.log('Fehler beim Löschen des Haustiers:', e.message); }
  }
}

(async () => {
  try {
    // 0. Login und JWT holen
    const JWT = await loginAndGetJWT();

    // Haustier anlegen
    createdPetId = await testCreatePet(JWT);

    // Medikation anlegen
    createdMedicationId = await testCreateMedication(JWT, createdPetId);

    // Erinnerung anlegen
    createdReminderId = await testCreateReminder(JWT, createdPetId, createdMedicationId);

    // Eigene Haustiere abfragen
    await testGetPets(JWT);

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

    // Cleanup am Ende
    await cleanup(JWT);

    console.log('== Alle API-Tests erfolgreich abgeschlossen ==');
  } catch (e) {
    console.error('Fehler beim Test:', e);
    process.exit(1);
  }
})(); 