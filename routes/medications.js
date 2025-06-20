const express = require('express');
const router = express.Router();
const { saveMedication, getOwnMedications, updateMedication, deleteMedication } = require('../services/medications');
const { medicationSchema } = require('../validation/medication');

// Medikation anlegen
router.post('/', async (req, res) => {
  try {
    const parse = medicationSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(422).json({ success: false, message: 'Validierungsfehler', errors: parse.error.errors });
    }
    const medication = await saveMedication(parse.data, req);
    res.json({ success: true, data: medication });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Alle eigenen Medikamente abfragen
router.get('/', async (req, res) => {
  try {
    const meds = await getOwnMedications(req);
    res.json({ success: true, data: meds });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Medikation aktualisieren
router.put('/:id', async (req, res) => {
  try {
    const med = await updateMedication(req.params.id, req.body, req);
    res.json({ success: true, data: med });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Medikation löschen
router.delete('/:id', async (req, res) => {
  try {
    await deleteMedication(req.params.id, req);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router; 