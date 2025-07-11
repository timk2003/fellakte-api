const { db } = require('./firebase');

/**
 * Speichert ein Medikament als Subdokument unter users/{USER_ID}/pets/{PET_ID}/medications
 * @param {Object} fields
 * @param {Object} req
 * @returns {Promise<Object>} Das gespeicherte Medikament
 */
async function saveMedication(fields, req) {
  const userId = req.user?.id;
  const petId = fields.pet_id;
  if (!userId) throw new Error('Kein user_id im Request');
  if (!petId) throw new Error('Kein pet_id im Request');
  const medData = {
    name: fields.name,
    dosage: fields.dosage,
    frequency: fields.frequency,
    start_date: fields.start_date,
    end_date: fields.end_date,
    notes: fields.notes,
    reminder: fields.reminder,
    reminder_times: fields.reminder_times,
    status: fields.status,
    therapy_type: fields.therapy_type,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  let ref;
  if (fields.id) {
    // Update
    ref = db.collection('users').doc(userId).collection('pets').doc(petId).collection('medications').doc(fields.id);
    await ref.set(medData, { merge: true });
  } else {
    // Neu anlegen
    ref = await db.collection('users').doc(userId).collection('pets').doc(petId).collection('medications').add(medData);
  }
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

/**
 * Gibt alle eigenen Medikamente für ein Pet zurück
 * @param {Object} req
 * @returns {Promise<Array>} Array von Medikamenten
 */
async function getOwnMedications(req) {
  const userId = req.user?.id;
  const petId = req.params.petId || req.body.pet_id;
  if (!userId) throw new Error('Kein user_id im Request');
  if (!petId) throw new Error('Kein pet_id im Request');
  const snapshot = await db.collection('users').doc(userId).collection('pets').doc(petId).collection('medications').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Aktualisiert ein Medikament
 * @param {string} id
 * @param {Object} fields
 * @param {Object} req
 * @returns {Promise<Object>} Das aktualisierte Medikament
 */
async function updateMedication(id, fields, req) {
  const userId = req.user?.id;
  const petId = fields.pet_id;
  if (!userId) throw new Error('Kein user_id im Request');
  if (!petId) throw new Error('Kein pet_id im Request');
  const ref = db.collection('users').doc(userId).collection('pets').doc(petId).collection('medications').doc(id);
  await ref.set({ ...fields, updatedAt: new Date().toISOString() }, { merge: true });
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

/**
 * Löscht ein Medikament
 * @param {string} id
 * @param {Object} req
 * @returns {Promise<void>}
 */
async function deleteMedication(id, req) {
  const userId = req.user?.id;
  const petId = req.params.petId || req.body.pet_id;
  if (!userId) throw new Error('Kein user_id im Request');
  if (!petId) throw new Error('Kein pet_id im Request');
  await db.collection('users').doc(userId).collection('pets').doc(petId).collection('medications').doc(id).delete();
}

module.exports = { saveMedication, getOwnMedications, updateMedication, deleteMedication }; 