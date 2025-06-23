const { getPetById } = require('./pets');
const { analyzeWithGroq } = require('./groq');
const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function analyzeFood(data, user) {
  let petData = data.pet_data;
  if (!petData && data.pet_id) {
    // Tierdaten aus DB holen
    const { data: pet, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', data.pet_id)
      .eq('user_id', user.id)
      .single();
    if (error || !pet) throw new Error('Tier nicht gefunden');
    petData = pet;
  }
  if (!petData) throw new Error('Tierdaten fehlen');

  // Root-Felder in petData übernehmen, falls sie dort fehlen
  ['activity_level', 'allergies', 'special_needs'].forEach((key) => {
    if (data[key] && !petData[key]) {
      petData[key] = data[key];
    }
  });

  // Prompt für KI bauen
  const prompt = `Analysiere das folgende Futter für das Tier und gib Empfehlungen, Warnungen und Alternativen:

Tierdaten: ${JSON.stringify(petData, null, 2)}
Futterdaten: ${JSON.stringify(data.food, null, 2)}
Besondere Hinweise: ${data.user_notes || '-'}

Bitte gib die Analyse im folgenden JSON-Format zurück:
{
  "calories_per_day": ...,
  "protein_g": ...,
  "fat_g": ...,
  "carbs_g": ...,
  "recommendations": [ ... ]
}`;

  // KI-Analyse (Groq/OpenAI)
  const analysis = await analyzeWithGroq(prompt);

  // Optional: Ergebnis speichern (z.B. in Tabelle food_analyses)
  // await supabase.from('food_analyses').insert({ user_id: user.id, pet_id: petData.id, ... });

  return analysis;
}

module.exports = { analyzeFood }; 