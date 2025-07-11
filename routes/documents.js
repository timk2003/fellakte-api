const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { getPresignedUrl, processOcr, saveDocument } = require('../services/documents');
const { runOcr } = require('../services/ocr');
const { analyzeWithGroq } = require('../services/groq');
const { insertDocument: insertFirebaseDocument } = require('../services/firebase');

// Presigned URL für Upload generieren
router.post('/presigned-url', async (req, res) => {
  try {
    const { filename, mimetype } = req.body;
    const url = await getPresignedUrl(filename, mimetype);
    res.json({ success: true, url });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// OCR & Analyse starten
router.post('/analyze', async (req, res) => {
  try {
    const { fileUrl } = req.body;
    const ocrText = await processOcr(fileUrl);
    const fields = await analyzeWithGroq(ocrText);
    fields.file_url = fileUrl;
    fields.file_type = 'image';
    const saved = await saveDocument(fields, req);
    res.json({ success: true, data: saved });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// KI-Analyse-Endpoint
router.post('/analyze/:type', async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const logPrefix = `[ANALYZE][${new Date().toISOString()}][User:${userId || 'anon'}]`;
  try {
    const { text, consent } = req.body;
    const { type } = req.params;
    if (!consent) {
      console.log(`${logPrefix} Fehler: Einwilligung fehlt`);
      return res.status(400).json({ success: false, message: 'Nutzer-Einwilligung erforderlich' });
    }
    if (!text || typeof text !== 'string') {
      console.log(`${logPrefix} Fehler: Kein Text übergeben`);
      return res.status(400).json({ success: false, message: 'Kein OCR-Text übergeben' });
    }
    if (!type) {
      console.log(`${logPrefix} Fehler: Kein Typ übergeben`);
      return res.status(400).json({ success: false, message: 'Kein Dokumenttyp angegeben' });
    }

    // Prompt-Logik je nach Typ
    let prompt;
    switch (type) {
      case 'vaccination':
        prompt = `Analysiere folgenden Impfpass-Text und gib alle relevanten Impfungen, Daten und Tierinfos als kompaktes JSON zurück. Text: ${text}`;
        break;
      case 'invoice':
        prompt = `Analysiere folgende Tierarzt-Rechnung und gib alle relevanten Rechnungsdaten, Positionen und Beträge als kompaktes JSON zurück. Text: ${text}`;
        break;
      case 'food':
        prompt = `Analysiere folgende Futterdeklaration und gib alle Nährwerte, Zutaten und Herstellerinfos als kompaktes JSON zurück. Text: ${text}`;
        break;
      case 'medical':
        prompt = `Analysiere folgenden medizinischen Bericht und gib alle Diagnosen, Medikamente und Empfehlungen als kompaktes JSON zurück. Text: ${text}`;
        break;
      default:
        prompt = `Analysiere folgendes Dokument und gib alle erkennbaren strukturierten Informationen als kompaktes JSON zurück. Text: ${text}`;
    }

    const result = await analyzeWithGroq(prompt);
    console.log(`${logPrefix} Analyse erfolgreich`);

    // Parallel in Supabase und Firebase speichern
    const docData = {
      type,
      data: result,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    insertFirebaseDocument(docData).then(() => {
      console.log(`${logPrefix} In Firebase gespeichert`);
    }).catch(e => {
      console.error(`${logPrefix} Firebase-Speicherfehler:`, e.message);
    });

    res.json({ success: true, type, data: result });
  } catch (e) {
    console.error(`${logPrefix} Fehler:`, e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// OCR-Endpoint
router.post('/ocr', upload.single('image'), async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const logPrefix = `[OCR][${new Date().toISOString()}][User:${userId || 'anon'}]`;
  try {
    // Nutzer-Einwilligung prüfen
    if (!req.body.consent) {
      console.log(`${logPrefix} Fehler: Einwilligung fehlt`);
      return res.status(400).json({ success: false, message: 'Nutzer-Einwilligung erforderlich' });
    }

    let imageData, mimetype;
    if (req.file) {
      imageData = req.file.buffer;
      mimetype = req.file.mimetype;
      if (req.file.size > 5 * 1024 * 1024) {
        console.log(`${logPrefix} Fehler: Bild zu groß (${req.file.size} Bytes)`);
        return res.status(400).json({ success: false, message: 'Bild zu groß (max. 5MB)' });
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(mimetype)) {
        console.log(`${logPrefix} Fehler: Falsches Format (${mimetype})`);
        return res.status(400).json({ success: false, message: 'Nur JPG, PNG oder WEBP erlaubt' });
      }
    } else if (req.body.imageBase64) {
      imageData = req.body.imageBase64;
      const match = /^data:(image\/(jpeg|png|webp|jpg));base64,/.exec(imageData);
      if (!match) {
        console.log(`${logPrefix} Fehler: Falsches Base64-Format`);
        return res.status(400).json({ success: false, message: 'Nur JPG, PNG oder WEBP erlaubt (Base64)'});
      }
      mimetype = match[1];
      const base64Length = imageData.length - imageData.indexOf(',') - 1;
      const approxBytes = base64Length * 0.75;
      if (approxBytes > 5 * 1024 * 1024) {
        console.log(`${logPrefix} Fehler: Base64-Bild zu groß (${approxBytes} Bytes)`);
        return res.status(400).json({ success: false, message: 'Bild zu groß (max. 5MB)'});
      }
      imageData = imageData.split(',')[1];
    } else {
      console.log(`${logPrefix} Fehler: Kein Bild übergeben`);
      return res.status(400).json({ success: false, message: 'Kein Bild übergeben' });
    }

    const text = await runOcr(imageData);
    console.log(`${logPrefix} OCR erfolgreich`);
    res.json({ success: true, text });
  } catch (e) {
    console.error(`${logPrefix} Fehler:`, e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router; 