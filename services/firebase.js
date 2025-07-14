const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

// Debug-Ausgaben für Service Account
console.log('Service Account Path:', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
console.log('Exists:', fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));

// Initialisierung (nur einmal pro Prozess)
let app;
if (!getFirestore.apps || getFirestore.apps.length === 0) {
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
    // Service Account JSON sicher laden
    const serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
    credential = cert(serviceAccount);
  } else {
    credential = applicationDefault();
  }
  app = initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}
const db = getFirestore();

/**
 * Speichert ein Dokument in der Collection 'documents'
 * @param {Object} data
 * @returns {Promise<Object>} Das gespeicherte Dokument oder Fehler
 */
async function insertDocument(data) {
  const ref = await db.collection('documents').add(data);
  const doc = await ref.get();
  return { id: ref.id, ...doc.data() };
}

module.exports = { insertDocument, db }; 