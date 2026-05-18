import { Router } from 'express';
import * as aiController from './ai.controller';
import { protect } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { askAiSchema } from './ai.schema';

const router = Router();

// Protect AI assistant routes
router.use(protect);

router.post('/chat', validate(askAiSchema), aiController.askAi);

export default router;
