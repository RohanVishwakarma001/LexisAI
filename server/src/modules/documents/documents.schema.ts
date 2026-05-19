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

export const documentQASchema = z.object({
  body: z.object({
    question: z.string().min(1, 'Question must not be empty'),
  }),
  params: z.object({
    id: z.string().uuid('Invalid Document ID'),
  }),
});

export type DocumentQAInput = z.infer<typeof documentQASchema>;
