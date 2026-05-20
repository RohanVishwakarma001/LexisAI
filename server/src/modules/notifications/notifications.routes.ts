import { Router } from 'express';
import * as notificationsController from './notifications.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', notificationsController.getMyNotifications);
router.patch('/read-all', notificationsController.markAllRead);
router.patch('/:id/read', notificationsController.markAsRead);

export default router;
