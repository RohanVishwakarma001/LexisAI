import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as authService from './auth.service';
import { env } from '../../config/env';

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

  const { password, ...userWithoutPassword } = updatedUser;

  res.status(200).json({
    status: 'success',
    data: { user: userWithoutPassword },
  });
});
