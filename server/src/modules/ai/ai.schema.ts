import { z } from 'zod';

export const askAiSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message cannot be empty'),
    caseId: z.string().uuid('Invalid Case ID').optional(),
  }),
});

export type AskAiInput = z.infer<typeof askAiSchema>['body'];
