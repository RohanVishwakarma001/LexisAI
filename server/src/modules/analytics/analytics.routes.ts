import { Router } from 'express';
import * as analyticsController from './analytics.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

// Protect executive metrics
router.use(protect);

router.get('/overview', analyticsController.getOverviewStats);

export default router;
