const { db } = require('./firebase');

/**
 * Speichert eine Erinnerung als Subdokument unter users/{USER_ID}/pets/{PET_ID}/reminders
 * @param {Object} fields
 * @param {Object} req
 * @returns {Promise<Object>} Die gespeicherte Erinnerung
 */
async function saveReminder(fields, req) {
  const userId = req.user?.id;
  const petId = fields.pet_id;
  if (!userId) throw new Error('Kein user_id im Request');
  if (!petId) throw new Error('Kein pet_id im Request');
  const reminderData = {
    title: fields.title,
    description: fields.description,
    reminder_date: fields.reminder_date,
    reminder_time: fields.reminder_time,
    reminder_type: fields.reminder_type,
    reminder_frequency: fields.reminder_frequency,
    reminder_times: fields.reminder_times,
    status: fields.status,
    email_notification: fields.email_notification,
    sms_notification: fields.sms_notification,
    medication_id: fields.medication_id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  let ref;
  if (fields.id) {
    // Update
    ref = db.collection('users').doc(userId).collection('pets').doc(petId).collection('reminders').doc(fields.id);
    await ref.set(reminderData, { merge: true });
  } else {
    // Neu anlegen
    ref = await db.collection('users').doc(userId).collection('pets').doc(petId).collection('reminders').add(reminderData);
  }
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

/**
 * Gibt alle eigenen Erinnerungen für ein Pet zurück
 * @param {Object} req
 * @returns {Promise<Array>} Array von Erinnerungen
 */
async function getOwnReminders(req) {
  const userId = req.user?.id;
  const petId = req.params.petId || req.body.pet_id;
  if (!userId) throw new Error('Kein user_id im Request');
  if (!petId) throw new Error('Kein pet_id im Request');
  const snapshot = await db.collection('users').doc(userId).collection('pets').doc(petId).collection('reminders').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Aktualisiert eine Erinnerung
 * @param {string} id
 * @param {Object} fields
 * @param {Object} req
 * @returns {Promise<Object>} Die aktualisierte Erinnerung
 */
async function updateReminder(id, fields, req) {
  const userId = req.user?.id;
  const petId = fields.pet_id;
  if (!userId) throw new Error('Kein user_id im Request');
  if (!petId) throw new Error('Kein pet_id im Request');
  const ref = db.collection('users').doc(userId).collection('pets').doc(petId).collection('reminders').doc(id);
  await ref.set({ ...fields, updatedAt: new Date().toISOString() }, { merge: true });
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
}

/**
 * Löscht eine Erinnerung
 * @param {string} id
 * @param {Object} req
 * @returns {Promise<void>}
 */
async function deleteReminder(id, req) {
  const userId = req.user?.id;
  const petId = req.params.petId || req.body.pet_id;
  if (!userId) throw new Error('Kein user_id im Request');
  if (!petId) throw new Error('Kein pet_id im Request');
  await db.collection('users').doc(userId).collection('pets').doc(petId).collection('reminders').doc(id).delete();
}

module.exports = { saveReminder, getOwnReminders, updateReminder, deleteReminder }; 