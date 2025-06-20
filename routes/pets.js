const express = require('express');
const router = express.Router();
const { savePet, getOwnPets } = require('../services/pets');
const { petSchema } = require('../validation/pet');

// Haustier anlegen
router.post('/', async (req, res) => {
  try {
    const parse = petSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(422).json({ success: false, message: 'Validierungsfehler', errors: parse.error.errors });
    }
    const pet = await savePet(parse.data, req);
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

// Alter berechnen
router.get('/:id/age', async (req, res) => {
  try {
    const { id } = req.params;
    const pets = await getOwnPets(req);
    const pet = pets.find(p => p.id === id);
    if (!pet || !pet.birth_date) {
      return res.status(404).json({ success: false, message: 'Haustier oder Geburtsdatum nicht gefunden' });
    }
    const birth = new Date(pet.birth_date);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    res.json({ success: true, data: { age } });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Nächsten Geburtstag berechnen
router.get('/:id/next-birthday', async (req, res) => {
  try {
    const { id } = req.params;
    const pets = await getOwnPets(req);
    const pet = pets.find(p => p.id === id);
    if (!pet || !pet.birth_date) {
      return res.status(404).json({ success: false, message: 'Haustier oder Geburtsdatum nicht gefunden' });
    }
    const birth = new Date(pet.birth_date);
    const now = new Date();
    let nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < now) {
      nextBirthday.setFullYear(now.getFullYear() + 1);
    }
    res.json({ success: true, data: { next_birthday: nextBirthday.toISOString().split('T')[0] } });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router; 