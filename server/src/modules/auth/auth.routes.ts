import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema } from './auth.schema';
import { protect, restrictTo } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/refresh', authController.refreshToken);
router.post('/refresh', authController.refreshToken);
router.get('/me', protect, authController.getMe);
router.patch('/profile', protect, authController.updateProfile);

// Two-Factor Authentication (2FA) Routes
router.post('/2fa/generate', protect, authController.generate2FA);
router.post('/2fa/verify', protect, authController.verify2FA);
router.post('/2fa/disable', protect, authController.disable2FA);
router.post('/login/2fa', authController.login2FA);

// Admin-only user management routes
router.get('/users', protect, restrictTo(Role.ADMIN), authController.getAllUsers);
router.patch('/users/:id/role', protect, restrictTo(Role.ADMIN), authController.updateUserRole);
router.delete('/users/:id', protect, restrictTo(Role.ADMIN), authController.deleteUser);

export default router;
