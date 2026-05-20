import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as notificationsService from './notifications.service';

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '10', 10);

  const notifications = await notificationsService.getMyNotifications(user.id, page, limit);

  res.status(200).json({
    status: 'success',
    data: notifications,
  });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const notification = await notificationsService.markAsRead(id as string, user.id);

  res.status(200).json({
    status: 'success',
    data: notification,
  });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  await notificationsService.markAllRead(user.id);

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
  });
});
