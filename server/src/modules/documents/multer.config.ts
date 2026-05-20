import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../../utils/AppError';

// Dynamic directory check and creation
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate secure filename prefixing timestamp and random identifier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file format. Only PDFs, TXT, DOCX, and JPEG/PNG images are allowed.', 415), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB file limit
  },
});

