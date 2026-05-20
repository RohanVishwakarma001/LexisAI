import prisma from '../../database';
import { TaskStatus } from '@prisma/client';
import { AppError } from '../../utils/AppError';

export const getTasksByCase = async (
  caseId: string,
  userId: string,
  userRole: string,
  page: number = 1,
  limit: number = 10
) => {
  // Check access to case
  const dbCase = await prisma.case.findUnique({
    where: { id: caseId },
  });

  if (!dbCase) {
    throw new AppError('Case not found', 404);
  }

  if (userRole !== 'ADMIN' && dbCase.clientId !== userId && dbCase.lawyerId !== userId) {
    throw new AppError('Access denied to this case', 403);
  }

  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where: { caseId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.task.count({ where: { caseId } }),
  ]);

  return {
    data: tasks,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const createTask = async (
  caseId: string,
  userId: string,
  userRole: string,
  data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    assignedToId?: string;
    dueDate?: string;
  }
) => {
  const dbCase = await prisma.case.findUnique({
    where: { id: caseId },
  });

  if (!dbCase) {
    throw new AppError('Case not found', 404);
  }

  if (userRole !== 'ADMIN' && dbCase.clientId !== userId && dbCase.lawyerId !== userId) {
    throw new AppError('Access denied to create tasks on this case', 403);
  }

  return prisma.task.create({
    data: {
      caseId,
      title: data.title,
      description: data.description || null,
      status: data.status || TaskStatus.TODO,
      assignedToId: data.assignedToId || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });
};

export const updateTask = async (
  taskId: string,
  userId: string,
  userRole: string,
  data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    assignedToId?: string;
    dueDate?: string;
  }
) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { case: true },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (userRole !== 'ADMIN' && task.case.clientId !== userId && task.case.lawyerId !== userId) {
    throw new AppError('Access denied to update tasks on this case', 403);
  }

  const updatePayload: any = {};
  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.assignedToId !== undefined) updatePayload.assignedToId = data.assignedToId;
  if (data.dueDate !== undefined) updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  return prisma.task.update({
    where: { id: taskId },
    data: updatePayload,
  });
};

export const deleteTask = async (taskId: string, userId: string, userRole: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { case: true },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (userRole !== 'ADMIN' && task.case.clientId !== userId && task.case.lawyerId !== userId) {
    throw new AppError('Access denied to delete tasks on this case', 403);
  }

  return prisma.task.delete({
    where: { id: taskId },
  });
};
