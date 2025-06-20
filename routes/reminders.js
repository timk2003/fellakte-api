const express = require('express');
const router = express.Router();
const { saveReminder } = require('../services/reminders');

// Erinnerung anlegen
router.post('/', async (req, res) => {
  try {
    const reminder = await saveReminder(req.body, req);
    res.json({ success: true, data: reminder });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router; 