import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as casesService from './cases.service';
import { logAction } from '../audit/audit.service';

export const getCases = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '10', 10);

  const paginatedResult = await casesService.getCases(user.id, user.role, page, limit);
  
  res.status(200).json({
    status: 'success',
    data: paginatedResult,
  });
});

export const createCase = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const newCase = await casesService.createCase(user.id, user.role, req.body);
  
  await logAction(user.id, 'CASE_CREATE', 'CASE', newCase.id, { title: newCase.title });

  res.status(201).json({
    status: 'success',
    data: { case: newCase },
  });
});

export const updateCase = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const updatedCase = await casesService.updateCase(id as string, user.id, user.role, req.body);
  
  await logAction(user.id, 'CASE_UPDATE', 'CASE', updatedCase.id, { status: updatedCase.status });

  res.status(200).json({
    status: 'success',
    data: { case: updatedCase },
  });
});

export const deleteCase = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  await casesService.deleteCase(id as string, user.id, user.role);
  
  await logAction(user.id, 'CASE_DELETE', 'CASE', id as string);

  res.status(200).json({
    status: 'success',
    message: 'Case deleted successfully',
  });
});

export const restoreCase = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const restoredCase = await casesService.restoreCase(id as string, user.id, user.role);

  await logAction(user.id, 'CASE_RESTORE', 'CASE', id as string);

  res.status(200).json({
    status: 'success',
    data: { case: restoredCase },
  });
});

export const getCaseMessages = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const messages = await casesService.getCaseMessages(id as string, user.id, user.role);

  res.status(200).json({
    status: 'success',
    data: { messages },
  });
});

export const exportCasePDF = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const pdfBuffer = await casesService.exportCasePDF(id as string, user.id, user.role);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="case-report-${id}.pdf"`);
  res.status(200).send(pdfBuffer);
});
