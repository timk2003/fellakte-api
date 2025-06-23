require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { sendReminderEmail, sendWhatsAppReminder } = require('./services/reminderNotifications');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // 1. Alle aktiven Medikamente für heute holen
  const { data: meds, error } = await supabase
    .from('medications')
    .select('*')
    .lte('start_date', today)
    .gte('end_date', today);
  if (error) throw error;

  for (const med of meds) {
    if (!med.reminder_times) continue;
    let reminderTimes;
    try {
      reminderTimes = typeof med.reminder_times === 'string' ? JSON.parse(med.reminder_times) : med.reminder_times;
    } catch (e) { continue; }

    for (const [key, val] of Object.entries(reminderTimes)) {
      if (!val.enabled || !val.time) continue;
      // Prüfen, ob Reminder schon existiert
      const { data: existing } = await supabase
        .from('reminders')
        .select('id')
        .eq('medication_id', med.id)
        .eq('reminder_date', today)
        .eq('reminder_time', val.time)
        .maybeSingle();
      if (existing) continue;
      // Reminder anlegen
      const { data: reminder, error: insErr } = await supabase
        .from('reminders')
        .insert({
          medication_id: med.id,
          reminder_date: today,
          reminder_time: val.time,
          reminder_type: 'medication',
          status: 'pending',
        })
        .select()
        .single();
      if (insErr) continue;
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
  console.log('Reminder-Generierung abgeschlossen.');
}

main().catch(e => { console.error(e); process.exit(1); }); 