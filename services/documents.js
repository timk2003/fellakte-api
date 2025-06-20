// services/documents.js

const { processOcr: tesseractOcr } = require('./ocr');
const { insertDocument, supabase } = require('./supabase');

async function getPresignedUrl(filename, mimetype) {
  // TODO: R2 Presigned URL generieren
  return 'https://r2-presigned-url.example';
}

async function processOcr(fileUrl) {
  return await tesseractOcr(fileUrl);
}

async function analyzeWithGroq(ocrText) {
  // TODO: Groq AI aufrufen und strukturierte Felder extrahieren
  return {
    impfstoff: 'Beispiel Impfstoff',
    datum: '2024-01-01',
    tiername: 'Bello',
    tierart: 'Hund',
  };
}

async function findPetIdByName(userId, petName) {
  if (!petName) return null;
  const { data, error } = await supabase
    .from('pets')
    .select('id')
    .eq('user_id', userId)
    .ilike('name', petName)
    .single();
  if (error) return null;
  return data?.id;
}

async function saveDocument(fields, req) {
  const userId = req.user?.id;
  if (!userId) throw new Error('Kein user_id im Request');
  const petId = await findPetIdByName(userId, fields.tiername);
  const docData = {
    user_id: userId,
    pet_id: petId,
    title: fields.title || fields.art_des_dokuments || 'Dokument',
    description: fields.description || '',
    file_url: fields.file_url,
    file_path: fields.file_path,
    file_type: fields.file_type || 'image',
    category: fields.category || fields.art_des_dokuments || 'other',
    name: fields.name || fields.tiername,
    // weitere Felder nach Bedarf
  };
  return await insertDocument(docData);
}

module.exports = {
  getPresignedUrl,
  processOcr,
  analyzeWithGroq,
  saveDocument,
}; 