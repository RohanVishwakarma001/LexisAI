import { Router } from 'express';
import * as hearingController from './hearings.controller';
import { validate } from '../../middleware/validate.middleware';
import { createHearingSchema, updateHearingSchema } from './hearings.schema';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', hearingController.getHearings);
router.post('/', validate(createHearingSchema), hearingController.createHearing);
router.patch('/:id', validate(updateHearingSchema), hearingController.updateHearing);
router.delete('/:id', hearingController.deleteHearing);

export default router;
