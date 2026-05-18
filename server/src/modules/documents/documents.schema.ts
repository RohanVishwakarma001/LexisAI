import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  body: z.object({
    caseId: z.string().uuid('Invalid Case ID'),
  }),
});

export const queryDocumentSchema = z.object({
  query: z.object({
    caseId: z.string().uuid('Invalid Case ID').optional(),
  }),
});
