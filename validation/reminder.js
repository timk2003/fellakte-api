const { z } = require('zod');

const reminderSchema = z.object({
  pet_id: z.string(), // UUID-Validierung entfernt, akzeptiert jetzt auch Firestore-IDs
  title: z.string().min(1),
  description: z.string().optional(),
  reminder_date: z.string().optional(),
  reminder_time: z.string().optional(),
  reminder_type: z.string().optional(),
  reminder_frequency: z.string().optional(),
  reminder_times: z.array(z.string()).optional(),
  status: z.string().optional(),
  email_notification: z.boolean().optional(),
  sms_notification: z.boolean().optional(),
  medication_id: z.string().optional(), // UUID-Validierung entfernt
});

module.exports = { reminderSchema }; 