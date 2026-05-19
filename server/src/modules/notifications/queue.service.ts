import { Queue, Worker } from 'bullmq';
import { logger } from '../../utils/logger';
import { sendMail } from './email.service';
import { env } from '../../config/env';

let emailQueue: Queue | null = null;
let emailWorker: Worker | null = null;
let useRedisFallback = true;

try {
  const isDummyRedis = env.REDIS_URL?.includes('your_redis_password');
  
  if (env.REDIS_URL && !isDummyRedis) {
    emailQueue = new Queue('emailQueue', {
      connection: {
        url: env.REDIS_URL
      }
    });

    emailWorker = new Worker(
      'emailQueue',
      async (job) => {
        const { to, subject, html } = job.data;
        await sendMail(to, subject, html);
      },
      {
        connection: {
          url: env.REDIS_URL
        }
      }
    );

    emailWorker.on('completed', (job) => {
      logger.info(`✅ Email Job ${job.id} completed successfully`);
    });

    emailWorker.on('failed', (job, err) => {
      logger.error(`❌ Email Job ${job?.id} failed:`, err);
    });

    useRedisFallback = false;
    logger.info('⚙️ BullMQ background queue initialized successfully.');
  } else {
    logger.warn('⚙️ No active Redis configuration found. Running jobs in-memory (synchronous fallback).');
  }
} catch (error) {
  logger.warn('⚙️ Failed to initialize Redis BullMQ. Falling back to in-memory processing:', error);
  useRedisFallback = true;
}

export const queueEmail = async (to: string, subject: string, html: string) => {
  if (!useRedisFallback && emailQueue) {
    try {
      await emailQueue.add('sendEmail', { to, subject, html });
      logger.info(`⚙️ Email job added to BullMQ: "${subject}" to ${to}`);
    } catch (err) {
      logger.warn('⚙️ BullMQ add failed, executing email in-memory fallback:', err);
      setImmediate(() => sendMail(to, subject, html));
    }
  } else {
    setImmediate(() => sendMail(to, subject, html));
  }
};
