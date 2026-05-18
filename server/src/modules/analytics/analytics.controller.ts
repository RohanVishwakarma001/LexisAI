import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as analyticsService from './analytics.service';

export const getOverviewStats = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const stats = await analyticsService.getOverviewStats(user.id, user.role);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});
