const express = require('express');
const router = express.Router();
const { getPresignedUrl, processOcr, analyzeWithGroq, saveDocument } = require('../services/documents');

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

module.exports = router; 