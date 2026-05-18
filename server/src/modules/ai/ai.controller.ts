import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as aiService from './ai.service';

export const askAi = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await aiService.queryAi(user.id, req.body);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
