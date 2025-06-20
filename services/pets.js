async function savePet(fields, req) {
  const supabase = req.userClient;
  const userId = req.user?.id;
  if (!userId) throw new Error('Kein user_id im Request');
  const petData = {
    user_id: userId,
    name: fields.name,
    species: fields.species,
    breed: fields.breed,
    birth_date: fields.birth_date,
    gender: fields.gender,
    color: fields.color,
    weight: fields.weight,
    microchip: fields.microchip,
    notes: fields.notes,
    last_vaccination: fields.last_vaccination,
    avatar_url: fields.avatar_url,
  };
  const { data, error } = await supabase.from('pets').insert([petData]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function getOwnPets(req) {
  const supabase = req.userClient;
  const userId = req.user?.id;
  if (!userId) throw new Error('Kein user_id im Request');
  const { data, error } = await supabase.from('pets').select('*').eq('user_id', userId);
  if (error) throw new Error(error.message);
  return data;
}

async function deletePet(id, req) {
  const supabase = req.userClient;
  const userId = req.user?.id;
  if (!userId) throw new Error('Kein user_id im Request');
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

module.exports = { savePet, getOwnPets, deletePet }; 