import { Request, Response } from 'express';
import * as hearingService from './hearings.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const getHearings = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '10', 10);

  const paginatedResult = await hearingService.getHearings(user.id, user.role, page, limit);

  res.status(200).json({
    status: 'success',
    data: paginatedResult,
  });
});

export const createHearing = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const hearing = await hearingService.createHearing(user.id, user.role, req.body);

  res.status(201).json({
    status: 'success',
    data: { hearing },
  });
});

export const updateHearing = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const hearing = await hearingService.updateHearing(id as string, user.id, user.role, req.body);

  res.status(200).json({
    status: 'success',
    data: { hearing },
  });
});

export const deleteHearing = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  await hearingService.deleteHearing(id as string, user.id, user.role);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
