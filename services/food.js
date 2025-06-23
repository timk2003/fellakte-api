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
  let prompt;
  if (data.is_current_food) {
    prompt = `Das folgende Futter ist das aktuelle Futter des Tieres. Analysiere es und gib Empfehlungen zur Optimierung, z.B. Menge, Zusammensetzung, Preis-Leistung, Alternativen. Antworte ausschließlich mit einem gültigen JSON-Objekt, ohne jeglichen Text davor oder danach.\n\nTierdaten: ${JSON.stringify(petData, null, 2)}\nFutterdaten: ${JSON.stringify(data.food, null, 2)}${data.food_price ? `\nPreis: ${data.food_price} EUR` : ''}\nBesondere Hinweise: ${data.user_notes || '-'}\n\nBitte gib die Analyse im folgenden JSON-Format zurück:\n{\n  "calories_per_day": ...,\n  "protein_g": ...,\n  "fat_g": ...,\n  "carbs_g": ...,\n  "recommendations": [ ... ]\n}`;
  } else {
    prompt = `Das folgende Futter ist ein neues/alternatives Futter für das Tier. Analysiere die Eignung und vergleiche es ggf. mit dem aktuellen Futter, falls bekannt. Antworte ausschließlich mit einem gültigen JSON-Objekt, ohne jeglichen Text davor oder danach.\n\nTierdaten: ${JSON.stringify(petData, null, 2)}\nFutterdaten: ${JSON.stringify(data.food, null, 2)}${data.food_price ? `\nPreis: ${data.food_price} EUR` : ''}\nBesondere Hinweise: ${data.user_notes || '-'}\n\nBitte gib die Analyse im folgenden JSON-Format zurück:\n{\n  "calories_per_day": ...,\n  "protein_g": ...,\n  "fat_g": ...,\n  "carbs_g": ...,\n  "recommendations": [ ... ]\n}`;
  }

  // KI-Analyse (Groq/OpenAI)
  const analysis = await analyzeWithGroq(prompt);

  // Wenn aktuelles Futter: Speichere Futterdaten im Tierprofil
  if (data.is_current_food && data.pet_id) {
    const updateFields = {
      food_brand: data.food.brand,
      food_type: data.food.type,
      food_amount_per_day_g: data.food.amount_per_day_g,
      food_price: data.food_price || null,
      food_nutrition: {
        calories_per_day: analysis.calories_per_day,
        protein_g: analysis.protein_g,
        fat_g: analysis.fat_g,
        carbs_g: analysis.carbs_g
      }
    };
    await supabase
      .from('pets')
      .update(updateFields)
      .eq('id', data.pet_id)
      .eq('user_id', user.id);
  }

  return analysis;
}

module.exports = { analyzeFood }; 