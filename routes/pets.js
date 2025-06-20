const express = require('express');
const router = express.Router();
const { savePet, getOwnPets } = require('../services/pets');

// Haustier anlegen
router.post('/', async (req, res) => {
  try {
    const pet = await savePet(req.body, req);
    res.json({ success: true, data: pet });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Eigene Haustiere abfragen
router.get('/', async (req, res) => {
  try {
    const pets = await getOwnPets(req);
    res.json({ success: true, data: pets });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router; 