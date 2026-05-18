import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../database';
import { Role } from '@prisma/client';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    
    // Check if token is in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Fallback to cookie
    else if (req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser || currentUser.deletedAt) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Add user to request
    (req as any).user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid token or token expired', 401));
  }
};

export const restrictTo = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
