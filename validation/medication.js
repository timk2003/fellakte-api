const { z } = require('zod');

const medicationSchema = z.object({
  pet_id: z.string().uuid(),
  name: z.string().min(1),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  notes: z.string().optional(),
  reminder: z.boolean().optional(),
  reminder_times: z.array(z.string()).optional(),
  status: z.string().optional(),
  therapy_type: z.string().optional(),
});

module.exports = { medicationSchema }; 