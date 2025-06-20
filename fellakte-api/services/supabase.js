const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Speichert ein Dokument in der Tabelle documents
 * @param {Object} data - Felder wie file_url, category, pet_id, title, description, user_id usw.
 * @returns {Promise<Object>} Das gespeicherte Dokument oder Fehler
 */
async function insertDocument(data) {
  const { data: doc, error } = await supabase
    .from('documents')
    .insert([data])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return doc;
}

module.exports = {
  supabase,
  insertDocument,
}; 