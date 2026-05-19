import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as auditService from './audit.service';

export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  const logsData = await auditService.getAuditLogs(page, limit);

  res.status(200).json({
    status: 'success',
    data: logsData,
  });
});
