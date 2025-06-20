const express = require('express');
const router = express.Router();
const { saveMedication } = require('../services/medications');

// Medikation anlegen
router.post('/', async (req, res) => {
  try {
    const medication = await saveMedication(req.body, req);
    res.json({ success: true, data: medication });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router; 