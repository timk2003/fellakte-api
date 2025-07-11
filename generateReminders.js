require('dotenv').config();
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const { sendReminderEmail, sendWhatsAppReminder } = require('./services/reminderNotifications');

async function main() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Alle User holen
  const usersSnap = await db.collection('users').get();
  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    // Alle Haustiere des Users holen
    const petsSnap = await db.collection('users').doc(userId).collection('pets').get();
    for (const petDoc of petsSnap.docs) {
      const petId = petDoc.id;
      // Alle aktiven Medikamente für heute holen
      const medsSnap = await db.collection('users').doc(userId).collection('pets').doc(petId).collection('medications').get();
      for (const medDoc of medsSnap.docs) {
        const med = medDoc.data();
        if (!med.reminder_times) continue;
        let reminderTimes;
        try {
          reminderTimes = typeof med.reminder_times === 'string' ? JSON.parse(med.reminder_times) : med.reminder_times;
        } catch (e) { continue; }

        for (const [key, val] of Object.entries(reminderTimes)) {
          if (!val.enabled || !val.time) continue;
          // Prüfen, ob Reminder schon existiert
          const remindersSnap = await db.collection('users').doc(userId).collection('pets').doc(petId).collection('reminders')
            .where('medication_id', '==', medDoc.id)
            .where('reminder_date', '==', today)
            .where('reminder_time', '==', val.time)
            .get();
          if (!remindersSnap.empty) continue;
          // Reminder anlegen
          const reminderData = {
            medication_id: medDoc.id,
            reminder_date: today,
            reminder_time: val.time,
            reminder_type: 'medication',
            status: 'pending',
          };
          await db.collection('users').doc(userId).collection('pets').doc(petId).collection('reminders').add(reminderData);
          // Benachrichtigung verschicken
          try {
            if (med.notify_email && med.user_email) {
              await sendReminderEmail(med.user_email, 'Medikamenten-Erinnerung', `Bitte denke an die Einnahme von ${med.name} um ${val.time}.`);
            }
            if (med.notify_whatsapp && med.user_whatsapp) {
              await sendWhatsAppReminder(med.user_whatsapp, `Bitte denke an die Einnahme von ${med.name} um ${val.time}.`);
            }
          } catch (e) {
            console.error('Benachrichtigung fehlgeschlagen:', e.message);
          }
        }
      }
    }
  }
  console.log('Reminder-Generierung abgeschlossen.');
}

main(); 