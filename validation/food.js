const { z } = require('zod');

const foodAnalysisSchema = z.object({
  pet_id: z.string().optional(),
  pet_data: z.object({
    name: z.string(),
    species: z.string(),
    breed: z.string().optional(),
    age: z.number().optional(),
    weight: z.number().optional(),
    allergies: z.array(z.string()).optional(),
    activity_level: z.string().optional(),
    special_needs: z.array(z.string()).optional(),
  }).optional(),
  food: z.object({
    brand: z.string(),
    type: z.string(),
    amount_per_day_g: z.number(),
  }),
  user_notes: z.string().optional(),
  activity_level: z.string().optional(),
  special_needs: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
});

function validateFoodAnalysis(req, res, next) {
  try {
    foodAnalysisSchema.parse(req.body);
    next();
  } catch (err) {
    res.status(422).json({ success: false, error: err.errors });
  }
}

module.exports = { validateFoodAnalysis }; 