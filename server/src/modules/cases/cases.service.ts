import prisma from '../../database';
import { CreateCaseInput, UpdateCaseInput } from './cases.schema';
import { Role } from '@prisma/client';
import { AppError } from '../../utils/AppError';
import { purgeFile } from '../../utils/cloudinary';

export const getCases = async (userId: string, role: Role) => {
  let filter: any = {};
  if (role === Role.LAWYER) {
    filter = { lawyerId: userId };
  } else if (role === Role.USER) {
    filter = { clientId: userId };
  }
  
  return prisma.case.findMany({
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
  });
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

  if (!existingCase) {
    throw new AppError('Case not found', 404);
  }

  if (role !== Role.ADMIN && existingCase.clientId !== userId) {
    throw new AppError('You do not have permission to delete this case', 403);
  }

  // 1. Fetch all documents associated with this case
  const documents = await prisma.document.findMany({
    where: { caseId },
  });

  // 2. Cascade purge all files from physical storage (Cloudinary or local sandbox disk)
  for (const doc of documents) {
    await purgeFile(doc.fileUrl, doc.metadata);
  }

  // 3. Hard delete all document rows associated with this case in the database
  await prisma.document.deleteMany({
    where: { caseId },
  });

  // 4. Hard delete the case record itself permanently from the database
  return prisma.case.delete({
    where: { id: caseId },
  });
};
