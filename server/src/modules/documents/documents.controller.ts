import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as documentsService from './documents.service';
import { AppError } from '../../utils/AppError';
import { logAction } from '../audit/audit.service';

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

  await logAction(user.id, 'DOCUMENT_UPLOAD', 'DOCUMENT', document.id, { fileName: document.fileName, caseId });

  res.status(201).json({
    status: 'success',
    data: { document },
  });
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  await documentsService.deleteDocument(id as string, user.id, user.role);

  await logAction(user.id, 'DOCUMENT_DELETE', 'DOCUMENT', id as string);

  res.status(200).json({
    status: 'success',
    message: 'Document removed successfully',
  });
});

export const documentQA = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { question, history, language } = req.body;

  if (!question) {
    throw new AppError('Question must be provided', 400);
  }

  const result = await documentsService.documentQA(id as string, question, history, language);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
