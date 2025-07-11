const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const { analyzeWithGroq } = require('./groq');

async function analyzeFood(data, user) {
  let petData = data.pet_data;
  if (!petData && data.pet_id) {
    // Tierdaten aus Firestore holen
    const petDoc = await db.collection('users').doc(user.id).collection('pets').doc(data.pet_id).get();
    if (!petDoc.exists) throw new Error('Tier nicht gefunden');
    petData = petDoc.data();
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
        calories_per_day: data.calories_per_day,
        protein_g: data.protein_g,
        fat_g: data.fat_g,
        carbs_g: data.carbs_g
      }
    };
    await db.collection('users').doc(user.id).collection('pets').doc(data.pet_id).set(updateFields, { merge: true });
  }

  return analysis;
}

module.exports = { analyzeFood }; 