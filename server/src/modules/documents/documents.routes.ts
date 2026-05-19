import { Router } from 'express';
import * as documentsController from './documents.controller';
import { protect } from '../../middleware/auth.middleware';
import { upload } from './multer.config';
import { validate } from '../../middleware/validate.middleware';
import { queryDocumentSchema, documentQASchema } from './documents.schema';

const router = Router();

// Secure all endpoints
router.use(protect);

router
  .route('/')
  .get(validate(queryDocumentSchema), documentsController.getDocuments)
  .post(upload.single('file'), documentsController.uploadDocument);

router
  .route('/:id')
  .delete(documentsController.deleteDocument);

router
  .route('/:id/qa')
  .post(validate(documentQASchema), documentsController.documentQA);

export default router;
