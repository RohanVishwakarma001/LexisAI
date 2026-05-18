import prisma from '../../database';
import { Role } from '@prisma/client';
import { AppError } from '../../utils/AppError';
import path from 'path';
import { uploadToCloudinary } from '../../utils/cloudinary';

export const getDocuments = async (userId: string, role: Role, caseId?: string) => {
  let caseFilter: any = {};
  if (role === Role.LAWYER) {
    caseFilter = { lawyerId: userId };
  } else if (role === Role.USER) {
    caseFilter = { clientId: userId };
  }

  if (caseId) {
    caseFilter.id = caseId;
  }

  return prisma.document.findMany({
    where: {
      deletedAt: null,
      case: {
        ...caseFilter,
        deletedAt: null,
      },
    },
    include: {
      case: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createDocument = async (
  userId: string,
  caseId: string,
  file: Express.Multer.File
) => {
  const parentCase = await prisma.case.findUnique({
    where: { id: caseId },
  });

  if (!parentCase || parentCase.deletedAt) {
    throw new AppError('Associated case file not found', 404);
  }

  // Simulate context-aware AI text extraction and brief summarizes based on extension
  const ext = path.extname(file.originalname).toLowerCase();
  let ocrText = 'Simulated document OCR analysis transcript.';
  let aiSummary = 'Automatic AI analysis summarization complete.';

  if (ext === '.pdf') {
    ocrText =
      'COMPLAINT AND DEMAND FOR JURY TRIAL. Plaintiff Doe hereby sues Defendant TechCorp for breach of warranty and failed software delivery. Damaged expectations exceed $150,000 under Master Services Agreement Exhibit B.';
    aiSummary =
      'This document represents a formal legal complaint alleging breach of contract and software warranty failure. Key requests include a jury trial, compensatory damages, and interest.';
  } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
    ocrText =
      'METADATA SCANNER: Evidence photo captured on 2026-05-12. Location Coordinates: 40.7128 N, 74.0060 W. High-resolution scan confirms vehicle rear impact and structural frame fracture.';
    aiSummary =
      'Image file evidence showing physical scene conditions. AI analysis confirms structural rear impact collision damage and provides location metadata coordinates.';
  } else if (ext === '.txt') {
    ocrText =
      'CASE NOTES BRIEF. Internal deposition checklist: verify timeline anomalies on corporate ledger, examine ledger timestamps, and interview chief audit representative Jenkins.';
    aiSummary =
      'Internal checklist for depositions regarding audit timeline inconsistencies and potential ledger anomalies.';
  }

  // Attempt Cloudinary ingestion with a graceful local disk fallback if credentials aren't present
  let fileUrl = `/uploads/${file.filename}`;
  try {
    const cloudUpload = await uploadToCloudinary(file.path);
    if (cloudUpload) {
      fileUrl = cloudUpload.secure_url;
    }
  } catch (cloudinaryError) {
    console.error('❌ Cloudinary cloud media storage upload failed:', cloudinaryError);
  }

  return prisma.document.create({
    data: {
      fileName: file.originalname,
      fileUrl,
      fileType: ext.replace('.', '').toUpperCase(),
      fileSize: file.size,
      caseId,
      uploadedBy: userId,
      metadata: {
        ocrText,
        aiSummary,
        indexedAt: new Date().toISOString(),
        status: 'INDEXED',
      },
    },
    include: {
      case: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

export const deleteDocument = async (documentId: string, userId: string, role: Role) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      case: true,
    },
  });

  if (!document || document.deletedAt) {
    throw new AppError('Document not found', 404);
  }

  // Access validation
  if (
    role !== Role.ADMIN &&
    document.uploadedBy !== userId &&
    document.case.clientId !== userId
  ) {
    throw new AppError('You do not have permission to delete this document', 403);
  }

  return prisma.document.update({
    where: { id: documentId },
    data: { deletedAt: new Date() },
  });
};
