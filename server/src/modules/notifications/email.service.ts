import nodemailer from 'nodemailer';
import { logger } from '../../utils/logger';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    logger.info('📧 Nodemailer SMTP transporter initialized.');
  } else {
    logger.warn('📧 No SMTP credentials configured. Emails will be logged to console.');
  }

  return transporter;
};

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    const transport = await getTransporter();
    
    if (transport) {
      const from = process.env.SMTP_FROM || '"LexisAI Support" <support@lexisai.in>';
      await transport.sendMail({
        from,
        to,
        subject,
        html,
      });
      logger.info(`📧 Email sent successfully to ${to}: "${subject}"`);
    } else {
      logger.info(`
=========================================
📧 EMAIL LOG (SMTP UNCONFIGURED)
To: ${to}
Subject: ${subject}
Body Snippet: ${html.replace(/<[^>]*>/g, ' ').substring(0, 300).trim()}...
=========================================
      `);
    }
  } catch (error) {
    logger.error(`❌ Failed to send email to ${to}:`, error);
  }
};
