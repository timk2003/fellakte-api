async function saveReminder(fields, req) {
  const supabase = req.userClient;
  const userId = req.user?.id;
  if (!userId) throw new Error('Kein user_id im Request');
  const reminderData = {
    user_id: userId,
    pet_id: fields.pet_id,
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
  };
  const { data, error } = await supabase.from('reminders').insert([reminderData]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

module.exports = { saveReminder }; 