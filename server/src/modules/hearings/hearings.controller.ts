import { Request, Response } from 'express';
import * as hearingService from './hearings.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const getHearings = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const hearings = await hearingService.getHearings(user.id, user.role);

  res.status(200).json({
    status: 'success',
    data: { hearings },
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
