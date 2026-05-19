import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as authService from './auth.service';
import { env } from '../../config/env';
import prisma from '../../database';
import { AppError } from '../../utils/AppError';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { logAction } from '../audit/audit.service';

const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/api/v1/auth/refresh', // Restrict refresh token to refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
  
  await logAction(user.id, 'USER_REGISTER', 'USER', user.id, { email: user.email });
  
  setTokenCookies(res, accessToken, refreshToken);
  
  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  res.status(201).json({
    status: 'success',
    data: { user: userWithoutPassword },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
  
  if (user.twoFactorEnabled) {
    res.status(200).json({
      status: '2fa_required',
      data: { userId: user.id },
    });
    return;
  }

  setTokenCookies(res, accessToken, refreshToken);

  const { password, ...userWithoutPassword } = user;

  res.status(200).json({
    status: 'success',
    data: { user: userWithoutPassword },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie('access_token', 'loggedout', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000),
  });
  
  res.cookie('refresh_token', 'loggedout', {
    httpOnly: true,
    path: '/api/v1/auth/refresh',
    expires: new Date(Date.now() + 10 * 1000),
  });

  res.status(200).json({ status: 'success' });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refresh_token;

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No refresh token provided' });
  }

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAuthTokens(token);
  
  setTokenCookies(res, accessToken, newRefreshToken);

  res.status(200).json({ status: 'success' });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { password, ...userWithoutPassword } = user;

  res.status(200).json({
    status: 'success',
    data: { user: userWithoutPassword },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { firstName, lastName, organizationName, phoneNumber, avatar } = req.body;

  const updatedUser = await authService.updateUserProfile(user.id, {
    firstName,
    lastName,
    organizationName,
    phoneNumber,
    avatar,
  });

  await logAction(user.id, 'USER_PROFILE_UPDATE', 'USER', user.id, {
    fields: Object.keys(req.body).filter(k => req.body[k] !== undefined && k !== 'avatar'),
  });

  const { password, ...userWithoutPassword } = updatedUser;

  res.status(200).json({
    status: 'success',
    data: { user: userWithoutPassword },
  });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await authService.getAllUsers();
  res.status(200).json({
    status: 'success',
    data: { users },
  });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const adminUser = (req as any).user;
  const id = req.params.id as string;
  const { role } = req.body;

  const updatedUser = await authService.updateUserRole(id, role);

  await logAction(adminUser.id, 'USER_ROLE_UPDATE', 'USER', id, { newRole: role });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const adminUser = (req as any).user;
  const id = req.params.id as string;
  
  await authService.deleteUser(id);

  await logAction(adminUser?.id || null, 'USER_DELETE', 'USER', id);

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
  });
});

export const generate2FA = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  const secret = speakeasy.generateSecret({
    name: `LexisAI Pro (${user.email})`,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: secret.base32,
    },
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

  res.status(200).json({
    status: 'success',
    data: {
      qrCode: qrCodeUrl,
      secret: secret.base32,
    },
  });
});

export const verify2FA = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { token } = req.body;

  if (!token) {
    throw new AppError('Please provide a 2FA verification token', 400);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || !dbUser.twoFactorSecret) {
    throw new AppError('2FA has not been setup/initialized', 400);
  }

  const verified = speakeasy.totp.verify({
    secret: dbUser.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!verified) {
    throw new AppError('Invalid verification code', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: true,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Two-factor authentication successfully enabled',
  });
});

export const disable2FA = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Two-factor authentication has been disabled',
  });
});

export const login2FA = asyncHandler(async (req: Request, res: Response) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    throw new AppError('User ID and 2FA token must be provided', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication not configured or invalid user', 401);
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!verified) {
    throw new AppError('Invalid verification code', 401);
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);
  setTokenCookies(res, accessToken, refreshToken);

  const { password, ...userWithoutPassword } = user;

  res.status(200).json({
    status: 'success',
    data: { user: userWithoutPassword },
  });
});

