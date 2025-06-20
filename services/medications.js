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

async function getOwnMedications(req) {
  const supabase = req.userClient;
  const userId = req.user?.id;
  if (!userId) throw new Error('Kein user_id im Request');
  const { data, error } = await supabase.from('medications').select('*').eq('user_id', userId);
  if (error) throw new Error(error.message);
  return data;
}

async function updateMedication(id, fields, req) {
  const supabase = req.userClient;
  const userId = req.user?.id;
  if (!userId) throw new Error('Kein user_id im Request');
  const { data, error } = await supabase
    .from('medications')
    .update(fields)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function deleteMedication(id, req) {
  const supabase = req.userClient;
  const userId = req.user?.id;
  if (!userId) throw new Error('Kein user_id im Request');
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

module.exports = {
  saveMedication,
  getOwnMedications,
  updateMedication,
  deleteMedication,
}; 