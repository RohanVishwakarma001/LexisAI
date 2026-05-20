import prisma from '../../database';
import { CreateHearingInput, UpdateHearingInput } from './hearings.schema';
import { Role, NotificationType } from '@prisma/client';
import { AppError } from '../../utils/AppError';
import { queueEmail } from '../notifications/queue.service';
import { createNotification } from '../notifications/notifications.service';

export const getHearings = async (userId: string, role: Role, page: number = 1, limit: number = 10) => {
  let caseFilter: any = {};
  if (role === Role.LAWYER) {
    caseFilter = { lawyerId: userId };
  } else if (role === Role.USER) {
    caseFilter = { clientId: userId };
  }

  const skip = (page - 1) * limit;

  const [hearings, total] = await Promise.all([
    prisma.hearing.findMany({
      where: {
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
            clientId: true,
            lawyerId: true,
            client: { select: { email: true, firstName: true } },
            lawyer: { select: { email: true, firstName: true } },
          },
        },
      },
      orderBy: { date: 'asc' },
      skip,
      take: limit,
    }),
    prisma.hearing.count({
      where: {
        case: {
          ...caseFilter,
          deletedAt: null,
        },
      },
    }),
  ]);

  return {
    data: hearings,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const createHearing = async (userId: string, role: Role, input: CreateHearingInput) => {
  const parentCase = await prisma.case.findUnique({
    where: { id: input.caseId },
    include: {
      client: true,
      lawyer: true,
    },
  });

  if (!parentCase || parentCase.deletedAt) {
    throw new AppError('Associated case file not found', 404);
  }

  if (
    role !== Role.ADMIN &&
    parentCase.clientId !== userId &&
    parentCase.lawyerId !== userId
  ) {
    throw new AppError('You do not have permission to add hearings to this case', 403);
  }

  const hearing = await prisma.hearing.create({
    data: {
      caseId: input.caseId,
      title: input.title,
      date: new Date(input.date),
      location: input.location,
      notes: input.notes,
    },
  });

  try {
    const formattedDate = new Date(input.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    if (parentCase.client) {
      await queueEmail(
        parentCase.client.email,
        `New Court Hearing Scheduled: ${parentCase.title}`,
        `<h1>Court Hearing Scheduled</h1>
         <p>A new court hearing has been listed for your case: <strong>${parentCase.title}</strong>.</p>
         <p><strong>Title:</strong> ${input.title}</p>
         <p><strong>Date & Time:</strong> ${formattedDate}</p>
         <p><strong>Location:</strong> ${input.location || 'N/A'}</p>`
      );
      await createNotification(
        parentCase.client.id,
        NotificationType.HEARING_REMINDER,
        'Court Hearing Scheduled',
        `A new court hearing "${input.title}" has been scheduled for case "${parentCase.title}" on ${formattedDate}`,
        hearing.id
      );
    }
    if (parentCase.lawyer) {
      await queueEmail(
        parentCase.lawyer.email,
        `New Court Hearing Scheduled: ${parentCase.title}`,
        `<h1>Court Hearing Scheduled</h1>
         <p>You have a new court hearing listed for Case: <strong>${parentCase.title}</strong>.</p>
         <p><strong>Title:</strong> ${input.title}</p>
         <p><strong>Date & Time:</strong> ${formattedDate}</p>
         <p><strong>Location:</strong> ${input.location || 'N/A'}</p>`
      );
      await createNotification(
        parentCase.lawyer.id,
        NotificationType.HEARING_REMINDER,
        'Court Hearing Scheduled',
        `A new court hearing "${input.title}" has been scheduled for case "${parentCase.title}" on ${formattedDate}`,
        hearing.id
      );
    }
  } catch (err) {
    console.error('Failed to send hearing scheduled email/notification:', err);
  }

  return hearing;
};

export const updateHearing = async (hearingId: string, userId: string, role: Role, input: UpdateHearingInput) => {
  const hearing = await prisma.hearing.findUnique({
    where: { id: hearingId },
    include: {
      case: true,
    },
  });

  if (!hearing) {
    throw new AppError('Hearing record not found', 404);
  }

  if (
    role !== Role.ADMIN &&
    hearing.case.clientId !== userId &&
    hearing.case.lawyerId !== userId
  ) {
    throw new AppError('You do not have permission to modify this hearing', 403);
  }

  return prisma.hearing.update({
    where: { id: hearingId },
    data: {
      title: input.title,
      date: input.date ? new Date(input.date) : undefined,
      location: input.location,
      notes: input.notes,
    },
  });
};

export const deleteHearing = async (hearingId: string, userId: string, role: Role) => {
  const hearing = await prisma.hearing.findUnique({
    where: { id: hearingId },
    include: {
      case: true,
    },
  });

  if (!hearing) {
    throw new AppError('Hearing record not found', 404);
  }

  if (
    role !== Role.ADMIN &&
    hearing.case.clientId !== userId &&
    hearing.case.lawyerId !== userId
  ) {
    throw new AppError('You do not have permission to delete this hearing', 403);
  }

  return prisma.hearing.delete({
    where: { id: hearingId },
  });
};
