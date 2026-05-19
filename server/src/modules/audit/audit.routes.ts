import { Router } from 'express';
import * as auditController from './audit.controller';
import { protect, restrictTo } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', protect, restrictTo(Role.ADMIN), auditController.getAuditLogs);

export default router;
