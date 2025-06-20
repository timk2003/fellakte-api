const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getUserClient(token) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

/**
 * Speichert ein Dokument in der Tabelle documents
 * @param {Object} data - Felder wie file_url, category, pet_id, title, description, user_id usw.
 * @returns {Promise<Object>} Das gespeicherte Dokument oder Fehler
 */
async function insertDocument(data) {
  const { data: doc, error } = await supabaseAdmin
    .from('documents')
    .insert([data])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return doc;
}

module.exports = {
  supabaseAdmin,
  getUserClient,
  insertDocument,
}; 