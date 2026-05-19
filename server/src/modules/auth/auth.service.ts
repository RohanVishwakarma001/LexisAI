import bcrypt from 'bcryptjs';
import prisma from '../../database';
import { AppError } from '../../utils/AppError';
import { RegisterInput, LoginInput } from './auth.schema';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { queueEmail } from '../notifications/queue.service';

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
    },
  });

  // Send Welcome Email
  try {
    await queueEmail(
      user.email,
      'Welcome to LexisAI',
      `<h1>Welcome to LexisAI, ${user.firstName || 'User'}!</h1>
       <p>Your legal workspace has been successfully initialized under Indian law context frameworks.</p>
       <p>Log in to configure your case workflows and document vaults.</p>`
    );
  } catch (emailErr) {
    console.error('Welcome email failed to queue:', emailErr);
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  return { user, accessToken, refreshToken };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || user.deletedAt) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  return { user, accessToken, refreshToken };
};

export const refreshAuthTokens = async (token: string) => {
  try {
    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.deletedAt) {
      throw new AppError('User not found', 401);
    }

    const newAccessToken = signAccessToken(user.id, user.role);
    const newRefreshToken = signRefreshToken(user.id);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};

export const updateUserProfile = async (
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    phoneNumber?: string;
    avatar?: string;
  }
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
};

export const getAllUsers = async () => {
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      organizationName: true,
      phoneNumber: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateUserRole = async (userId: string, role: string) => {
  const validRoles = ['USER', 'LAWYER', 'ADMIN'];
  if (!validRoles.includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role: role as any },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });
};

export const deleteUser = async (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });
};

