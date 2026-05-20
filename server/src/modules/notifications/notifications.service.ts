import prisma from '../../database';
import { NotificationType } from '@prisma/client';
import { getIO } from '../../utils/socket';
import { logger } from '../../utils/logger';

export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  entityId?: string
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        entityId: entityId || null,
      },
    });

    // Attempt real-time Socket.io broadcast
    try {
      const io = getIO();
      io.to(userId).emit('notification:new', notification);
    } catch (socketErr) {
      // Gracefully handle if socket server is not yet initialized (e.g. in tests or migrations)
      logger.warn(`Could not dispatch socket notification to user ${userId} since socket is uninitialized.`);
    }

    return notification;
  } catch (err) {
    logger.error('Failed to create user database notification:', err);
    return null;
  }
};

export const getMyNotifications = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: [
        { isRead: 'asc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return {
    data: notifications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const markAsRead = async (notificationId: string, userId: string) => {
  return prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};

export const markAllRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
