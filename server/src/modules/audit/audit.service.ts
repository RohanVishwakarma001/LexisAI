import prisma from '../../database';

export const logAction = async (
  userId: string | null,
  action: string,
  entity: string,
  entityId: string | null = null,
  metadata: any = null
) => {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};

export const getAuditLogs = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count(),
  ]);

  const userIds = Array.from(new Set(logs.map((l) => l.userId).filter(Boolean))) as string[];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const resolvedLogs = logs.map((log) => ({
    ...log,
    user: log.userId ? userMap.get(log.userId) || null : null,
  }));

  return {
    logs: resolvedLogs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
