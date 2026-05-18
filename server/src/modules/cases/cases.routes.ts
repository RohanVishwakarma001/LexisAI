import { Router } from 'express';
import * as casesController from './cases.controller';
import { protect } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createCaseSchema, updateCaseSchema } from './cases.schema';

const router = Router();

// Protect all case endpoints
router.use(protect);

router
  .route('/')
  .get(casesController.getCases)
  .post(validate(createCaseSchema), casesController.createCase);

router
  .route('/:id')
  .patch(validate(updateCaseSchema), casesController.updateCase)
  .delete(casesController.deleteCase);

export default router;
