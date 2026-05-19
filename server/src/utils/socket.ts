import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import prisma from '../database';
import { logger } from './logger';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`🔌 Socket client connected: ${socket.id}`);

    // Join case chat room
    socket.on('join_case', (caseId: string) => {
      socket.join(caseId);
      logger.info(`👤 Client ${socket.id} joined case room: ${caseId}`);
    });

    // Leave case room
    socket.on('leave_case', (caseId: string) => {
      socket.leave(caseId);
      logger.info(`👤 Client ${socket.id} left case room: ${caseId}`);
    });

    // Listen for incoming messages
    socket.on('send_message', async (data: { caseId: string; senderId: string; content: string }) => {
      const { caseId, senderId, content } = data;
      
      try {
        // Save message to database
        const message = await prisma.message.create({
          data: {
            caseId,
            senderId,
            content,
          },
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
        });

        // Broadcast to case room
        io.to(caseId).emit('receive_message', message);
      } catch (err) {
        logger.error('Failed to save case message:', err);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};
