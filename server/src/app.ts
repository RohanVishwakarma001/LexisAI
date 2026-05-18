import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import caseRoutes from './modules/cases/cases.routes';
import documentRoutes from './modules/documents/documents.routes';
import aiRoutes from './modules/ai/ai.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import paymentsRoutes from './modules/payments/payments.routes';

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to LexisAI API',
  });
});

// Setup Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cases', caseRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/payments', paymentsRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
