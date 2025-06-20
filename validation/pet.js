const { z } = require('zod');

const petSchema = z.object({
  name: z.string().min(1),
  species: z.enum(['dog', 'cat']),
  breed: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  color: z.string().optional(),
  weight: z.number().optional(),
  microchip: z.string().optional(),
  notes: z.string().optional(),
  last_vaccination: z.string().optional(),
  avatar_url: z.string().url().nullable().optional(),
});

module.exports = { petSchema }; 