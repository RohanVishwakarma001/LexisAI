import { z } from 'zod';

export const createHearingSchema = z.object({
  caseId: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  date: z.string().datetime('Invalid ISO date string'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const updateHearingSchema = z.object({
  title: z.string().min(3).optional(),
  date: z.string().datetime().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateHearingInput = z.infer<typeof createHearingSchema>;
export type UpdateHearingInput = z.infer<typeof updateHearingSchema>;
