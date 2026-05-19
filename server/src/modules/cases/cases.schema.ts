import { z } from 'zod';
import { CaseStatus } from '@prisma/client';

export const createCaseSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long'),
    description: z.string().optional(),
    status: z.nativeEnum(CaseStatus).default(CaseStatus.OPEN),
  }),
});

export const updateCaseSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long').optional(),
    description: z.string().optional(),
    status: z.nativeEnum(CaseStatus).optional(),
    lawyerId: z.string().uuid('Invalid Lawyer ID').nullable().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid Case ID'),
  }),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>['body'];
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>['body'];
