const express = require('express');
const router = express.Router();
const { saveReminder, getOwnReminders, updateReminder, deleteReminder } = require('../services/reminders');
const { reminderSchema } = require('../validation/reminder');

// Erinnerung anlegen
router.post('/', async (req, res) => {
  try {
    const parse = reminderSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(422).json({ success: false, message: 'Validierungsfehler', errors: parse.error.errors });
    }
    const reminder = await saveReminder(parse.data, req);
    res.json({ success: true, data: reminder });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Alle eigenen Erinnerungen abfragen
router.get('/', async (req, res) => {
  try {
    const reminders = await getOwnReminders(req);
    res.json({ success: true, data: reminders });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Erinnerung aktualisieren
router.put('/:id', async (req, res) => {
  try {
    const reminder = await updateReminder(req.params.id, req.body, req);
    res.json({ success: true, data: reminder });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Erinnerung löschen
router.delete('/:id', async (req, res) => {
  try {
    await deleteReminder(req.params.id, req);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router; 