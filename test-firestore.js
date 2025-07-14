const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = getFirestore();

db.collection('test').add({ hello: 'world', time: new Date().toISOString() })
  .then(() => console.log('Firestore-Test erfolgreich!'))
  .catch(e => console.error('Firestore-Test fehlgeschlagen:', e)); 