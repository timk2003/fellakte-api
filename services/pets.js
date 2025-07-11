const { db } = require('./firebase');

/**
 * Speichert ein Haustier als Subdokument unter users/{USER_ID}/pets
 * @param {Object} fields
 * @param {Object} req
 * @returns {Promise<Object>} Das gespeicherte Haustier
 */
async function savePet(fields, req) {
  const userId = req.user?.id;
  if (!userId) throw new Error('Kein user_id im Request');
  const petData = {
    name: fields.name,
    species: fields.species,
    breed: fields.breed,
    birthDate: fields.birthDate,
    gender: fields.gender,
    profileImagePath: fields.profileImagePath || null,
    weight: fields.weight || null,
    chipNumber: fields.chipNumber || null,
    insurance: fields.insurance || null,
    passportNumber: fields.passportNumber || null,
    notes: fields.notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  let ref;
  if (fields.id) {
    // Update
    ref = db.collection('users').doc(userId).collection('pets').doc(fields.id);
    await ref.set(petData, { merge: true });
  } else {
    // Neu anlegen
    ref = await db.collection('users').doc(userId).collection('pets').add(petData);
  }
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

/**
 * Gibt alle eigenen Haustiere des Users zurück
 * @param {Object} req
 * @returns {Promise<Array>} Array von Haustieren
 */
async function getOwnPets(req) {
  const userId = req.user?.id;
  if (!userId) throw new Error('Kein user_id im Request');
  const snapshot = await db.collection('users').doc(userId).collection('pets').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Löscht ein Haustier
 * @param {string} id
 * @param {Object} req
 * @returns {Promise<void>}
 */
async function deletePet(id, req) {
  const userId = req.user?.id;
  if (!userId) throw new Error('Kein user_id im Request');
  await db.collection('users').doc(userId).collection('pets').doc(id).delete();
}

module.exports = { savePet, getOwnPets, deletePet }; 