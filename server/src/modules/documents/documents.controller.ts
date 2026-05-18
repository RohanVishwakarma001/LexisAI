import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as documentsService from './documents.service';
import { AppError } from '../../utils/AppError';

export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { caseId } = req.query;

  const documents = await documentsService.getDocuments(
    user.id,
    user.role,
    caseId as string
  );

  res.status(200).json({
    status: 'success',
    results: documents.length,
    data: { documents },
  });
});

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { caseId } = req.body;
  const file = req.file;

  if (!file) {
    throw new AppError('Please provide a file to upload', 400);
  }

  if (!caseId) {
    throw new AppError('Please provide a target caseId to assign the document', 400);
  }

  const document = await documentsService.createDocument(user.id, caseId as string, file);

  res.status(201).json({
    status: 'success',
    data: { document },
  });
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  await documentsService.deleteDocument(id as string, user.id, user.role);

  res.status(200).json({
    status: 'success',
    message: 'Document removed successfully',
  });
});
