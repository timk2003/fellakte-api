// services/documents.js

const { db } = require('./firebase');

/**
 * Speichert ein Dokument als Subdokument unter users/{USER_ID}/pets/{PET_ID}/documents
 * @param {Object} fields
 * @param {Object} req
 * @returns {Promise<Object>} Das gespeicherte Dokument
 */
async function saveDocument(fields, req) {
  const userId = req.user?.id;
  const petId = fields.pet_id;
  if (!userId) throw new Error('Kein user_id im Request');
  if (!petId) throw new Error('Kein pet_id im Request');
  const docData = {
    title: fields.title || 'Dokument',
    description: fields.description || '',
    file_url: fields.file_url,
    file_type: fields.file_type || 'image',
    category: fields.category || 'other',
    name: fields.name || null,
    file_path: fields.file_path || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // weitere Felder nach Bedarf
  };
  let ref;
  if (fields.id) {
    // Update
    ref = db.collection('users').doc(userId).collection('pets').doc(petId).collection('documents').doc(fields.id);
    await ref.set(docData, { merge: true });
  } else {
    // Neu anlegen
    ref = await db.collection('users').doc(userId).collection('pets').doc(petId).collection('documents').add(docData);
  }
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

/**
 * Gibt alle Dokumente für ein Pet zurück
 * @param {string} petId
 * @param {Object} req
 * @returns {Promise<Array>} Array von Dokumenten
 */
async function getDocumentsByPet(petId, req) {
  const userId = req.user?.id;
  if (!userId) throw new Error('Kein user_id im Request');
  if (!petId) throw new Error('Kein pet_id im Request');
  const snapshot = await db.collection('users').doc(userId).collection('pets').doc(petId).collection('documents').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

module.exports = { saveDocument, getDocumentsByPet }; 