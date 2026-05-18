import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as casesService from './cases.service';

export const getCases = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const cases = await casesService.getCases(user.id, user.role);
  
  res.status(200).json({
    status: 'success',
    results: cases.length,
    data: { cases },
  });
});

export const createCase = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const newCase = await casesService.createCase(user.id, user.role, req.body);
  
  res.status(201).json({
    status: 'success',
    data: { case: newCase },
  });
});

export const updateCase = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const updatedCase = await casesService.updateCase(id as string, user.id, user.role, req.body);
  
  res.status(200).json({
    status: 'success',
    data: { case: updatedCase },
  });
});

export const deleteCase = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  await casesService.deleteCase(id as string, user.id, user.role);
  
  res.status(200).json({
    status: 'success',
    message: 'Case deleted successfully',
  });
});
