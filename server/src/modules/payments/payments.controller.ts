import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as paymentsService from './payments.service';
import { AppError } from '../../utils/AppError';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError('Please provide a valid payment amount', 400);
  }

  const orderDetails = await paymentsService.createRazorpayOrder(user.id, amount);

  res.status(201).json({
    status: 'success',
    data: orderDetails,
  });
});

export const verifySignature = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError('Missing payment signature parameters', 400);
  }

  const payment = await paymentsService.verifyPaymentSignature(
    user.id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  res.status(200).json({
    status: 'success',
    data: { payment },
  });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const invoices = await paymentsService.getInvoicesHistory(user.id);

  res.status(200).json({
    status: 'success',
    results: invoices.length,
    data: { invoices },
  });
});
