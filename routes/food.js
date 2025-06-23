const express = require('express');
const router = express.Router();
const { analyzeFood } = require('../services/food');
const { validateFoodAnalysis } = require('../validation/food');
const auth = require('../middleware/auth');

router.post('/analyze', auth, validateFoodAnalysis, async (req, res) => {
  try {
    const result = await analyzeFood(req.body, req.user);
    res.json({ success: true, analysis: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router; 