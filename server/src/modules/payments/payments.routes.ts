import { Router } from 'express';
import * as paymentsController from './payments.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

// Shield all transaction pathways
router.use(protect);

router.post('/create-order', paymentsController.createOrder);
router.post('/verify-signature', paymentsController.verifySignature);
router.get('/history', paymentsController.getHistory);

export default router;
