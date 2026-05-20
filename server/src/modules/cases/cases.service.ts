import prisma from '../../database';
import { CreateCaseInput, UpdateCaseInput } from './cases.schema';
import { Role } from '@prisma/client';
import { AppError } from '../../utils/AppError';
import { purgeFile } from '../../utils/cloudinary';
import { queueEmail } from '../notifications/queue.service';

export const getCases = async (userId: string, role: Role, page: number = 1, limit: number = 10) => {
  let filter: any = {};
  if (role === Role.LAWYER) {
    filter = { lawyerId: userId };
  } else if (role === Role.USER) {
    filter = { clientId: userId };
  }
  
  const skip = (page - 1) * limit;

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where: {
        ...filter,
        deletedAt: null,
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        lawyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: { documents: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.case.count({
      where: {
        ...filter,
        deletedAt: null,
      },
    }),
  ]);
  
  return {
    data: cases,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const createCase = async (userId: string, role: Role, input: CreateCaseInput) => {
  // If the user is client, they are the client. If admin, they are client as fallback or they can assign themselves.
  // To keep it simple and robust, the creator is assigned as client.
  return prisma.case.create({
    data: {
      title: input.title,
      description: input.description || '',
      status: input.status,
      clientId: userId,
    },
    include: {
      client: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

export const updateCase = async (caseId: string, userId: string, role: Role, input: UpdateCaseInput) => {
  const existingCase = await prisma.case.findUnique({
    where: { id: caseId },
  });

  if (!existingCase || existingCase.deletedAt) {
    throw new AppError('Case not found', 404);
  }

  // Auth check: Clients and Lawyers can only update their own assigned cases. Admins can update all.
  if (
    role !== Role.ADMIN &&
    existingCase.clientId !== userId &&
    existingCase.lawyerId !== userId
  ) {
    throw new AppError('You do not have permission to modify this case', 403);
  }

  // Trigger Case Assignment Email (Feature 1)
  if (input.lawyerId && input.lawyerId !== existingCase.lawyerId) {
    const lawyer = await prisma.user.findUnique({
      where: { id: input.lawyerId },
    });
    if (lawyer) {
      try {
        await queueEmail(
          lawyer.email,
          'New Case Assigned',
          `<h1>Case Assignment</h1>
           <p>You have been assigned as the counsel for Case: <strong>${existingCase.title}</strong>.</p>
           <p>Log in to view case briefs, client metadata, and file timelines.</p>`
        );
      } catch (emailErr) {
        console.error('Case assignment email failed to queue:', emailErr);
      }
    }
  }

  return prisma.case.update({
    where: { id: caseId },
    data: input,
    include: {
      client: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

export const deleteCase = async (caseId: string, userId: string, role: Role) => {
  const existingCase = await prisma.case.findUnique({
    where: { id: caseId },
  });

  if (!existingCase || existingCase.deletedAt) {
    throw new AppError('Case not found', 404);
  }

  if (role !== Role.ADMIN && existingCase.clientId !== userId) {
    throw new AppError('You do not have permission to delete this case', 403);
  }

  // Soft delete case
  return prisma.case.update({
    where: { id: caseId },
    data: { deletedAt: new Date() },
  });
};

export const restoreCase = async (caseId: string, userId: string, role: Role) => {
  const existingCase = await prisma.case.findUnique({
    where: { id: caseId },
  });

  if (!existingCase) {
    throw new AppError('Case not found', 404);
  }

  if (role !== Role.ADMIN && existingCase.clientId !== userId) {
    throw new AppError('You do not have permission to restore this case', 403);
  }

  return prisma.case.update({
    where: { id: caseId },
    data: { deletedAt: null },
  });
};

export const getCaseMessages = async (caseId: string, userId: string, role: Role) => {
  const existingCase = await prisma.case.findUnique({
    where: { id: caseId },
  });

  if (!existingCase || existingCase.deletedAt) {
    throw new AppError('Case not found', 404);
  }

  if (
    role !== Role.ADMIN &&
    existingCase.clientId !== userId &&
    existingCase.lawyerId !== userId
  ) {
    throw new AppError('You do not have permission to view messages for this case', 403);
  }

  return prisma.message.findMany({
    where: { caseId },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const exportCasePDF = async (caseId: string, userId: string, role: Role): Promise<Buffer> => {
  const existingCase = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      client: {
        select: { firstName: true, lastName: true, email: true },
      },
      lawyer: {
        select: { firstName: true, lastName: true, email: true },
      },
      documents: true,
      hearings: {
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!existingCase || existingCase.deletedAt) {
    throw new AppError('Case not found', 404);
  }

  if (
    role !== Role.ADMIN &&
    existingCase.clientId !== userId &&
    existingCase.lawyerId !== userId
  ) {
    throw new AppError('You do not have permission to view messages for this case', 403);
  }

  const PDFDocument = require('pdfkit');

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err: Error) => reject(err));

    const primaryColor = '#6750A4';
    const textColor = '#1A1C1E';
    const lightText = '#606266';

    doc.fillColor(primaryColor).fontSize(26).text('LEXISAI LEGAL MATTER REPORT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor(lightText).fontSize(10).text(`Generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fillColor(primaryColor).fontSize(16).text('1. Case Overview', { underline: true });
    doc.moveDown(0.5);

    doc.fillColor(textColor).fontSize(12);
    doc.text(`Case ID: ${existingCase.id}`);
    doc.text(`Title: ${existingCase.title}`);
    doc.text(`Status: ${existingCase.status}`);
    doc.text(`Date Registered: ${new Date(existingCase.createdAt).toLocaleDateString('en-IN')}`);
    doc.moveDown(0.5);

    doc.text(`Client: ${existingCase.client.firstName || ''} ${existingCase.client.lastName || ''} (${existingCase.client.email})`);
    if (existingCase.lawyer) {
      doc.text(`Assigned Counsel: ${existingCase.lawyer.firstName || ''} ${existingCase.lawyer.lastName || ''} (${existingCase.lawyer.email})`);
    } else {
      doc.text('Assigned Counsel: Unassigned');
    }
    doc.moveDown(1);

    doc.fillColor(primaryColor).fontSize(14).text('Summary Brief');
    doc.moveDown(0.3);
    doc.fillColor(textColor).fontSize(11).text(existingCase.description || 'No description provided.', { align: 'justify', lineGap: 4 });
    doc.moveDown(1.5);

    doc.fillColor(primaryColor).fontSize(16).text('2. Court Hearings & Deadlines', { underline: true });
    doc.moveDown(0.5);

    if (existingCase.hearings.length === 0) {
      doc.fillColor(lightText).fontSize(11).text('No scheduled court hearings.');
    } else {
      existingCase.hearings.forEach((h, index) => {
        doc.fillColor(textColor).fontSize(12).text(`${index + 1}. ${h.title}`);
        doc.fillColor(lightText).fontSize(10);
        doc.text(`   Date/Time: ${new Date(h.date).toLocaleString('en-IN')}`);
        doc.text(`   Location: ${h.location || 'N/A'}`);
        if (h.notes) {
          doc.text(`   Directions: ${h.notes}`);
        }
        doc.moveDown(0.5);
      });
    }
    doc.moveDown(1.5);

    doc.fillColor(primaryColor).fontSize(16).text('3. Case Document Index', { underline: true });
    doc.moveDown(0.5);

    if (existingCase.documents.length === 0) {
      doc.fillColor(lightText).fontSize(11).text('No discovery documents filed in vault.');
    } else {
      existingCase.documents.forEach((d, index) => {
        doc.fillColor(textColor).fontSize(11).text(`${index + 1}. ${d.fileName} (${(d.fileSize / (1024 * 1024)).toFixed(2)} MB)`);
        doc.fillColor(lightText).fontSize(9).text(`   Type: ${d.fileType} | Date Added: ${new Date(d.createdAt).toLocaleDateString('en-IN')}`);
        doc.moveDown(0.3);
      });
    }

    doc.moveDown(2);
    doc.fillColor(primaryColor).fontSize(10).text('--- Confidential Legal Matter Document ---', { align: 'center' });

    doc.end();
  });
};
