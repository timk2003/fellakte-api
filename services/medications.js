async function saveMedication(fields, req) {
  const supabase = req.userClient;
  const userId = req.user?.id;
  if (!userId) throw new Error('Kein user_id im Request');
  const medicationData = {
    user_id: userId,
    pet_id: fields.pet_id,
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
  };
  const { data, error } = await supabase.from('medications').insert([medicationData]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

module.exports = { saveMedication }; 