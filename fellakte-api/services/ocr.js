const Tesseract = require('tesseract.js');
const fetch = require('node-fetch');

async function processOcr(url) {
  // Bild herunterladen
  const response = await fetch(url);
  if (!response.ok) throw new Error('Bild konnte nicht geladen werden');
  const buffer = await response.buffer();

  // OCR mit Tesseract
  const { data: { text } } = await Tesseract.recognize(buffer, 'deu+eng', {
    logger: () => {}, // Optional: Fortschritt
  });
  return text;
}

module.exports = { processOcr }; 