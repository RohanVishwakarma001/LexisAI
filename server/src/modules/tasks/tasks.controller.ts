import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as tasksService from './tasks.service';
import { AppError } from '../../utils/AppError';
import { logAction } from '../audit/audit.service';

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { caseId } = req.query;
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '10', 10);

  if (!caseId) {
    throw new AppError('Please specify caseId query parameter', 400);
  }

  const paginatedResult = await tasksService.getTasksByCase(
    caseId as string,
    user.id,
    user.role,
    page,
    limit
  );

  res.status(200).json({
    status: 'success',
    data: paginatedResult,
  });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { caseId } = req.body;

  if (!caseId) {
    throw new AppError('Please provide a caseId to link this task to', 400);
  }

  const task = await tasksService.createTask(caseId as string, user.id, user.role, req.body);

  await logAction(user.id, 'TASK_CREATE', 'TASK', task.id, { title: task.title, caseId });

  res.status(201).json({
    status: 'success',
    data: { task },
  });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const task = await tasksService.updateTask(id as string, user.id, user.role, req.body);

  await logAction(user.id, 'TASK_UPDATE', 'TASK', task.id, { status: task.status, title: task.title });

  res.status(200).json({
    status: 'success',
    data: { task },
  });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  await tasksService.deleteTask(id as string, user.id, user.role);

  await logAction(user.id, 'TASK_DELETE', 'TASK', id as string);

  res.status(200).json({
    status: 'success',
    message: 'Task removed successfully',
  });
});
