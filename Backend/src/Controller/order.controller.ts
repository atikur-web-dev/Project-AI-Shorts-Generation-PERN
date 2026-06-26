// Backend/src/controller/order.controller.ts
import type { Request, Response } from 'express';
import { createOrder } from '../services/order.service.js';
import { logger } from '../config/logger.js';

export const createOrderController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { subscriptionId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID is required',
      });
    }

    const order = await createOrder(userId, subscriptionId);

    // Payment URL (Day 2-তে SSLCommerz যোগ করবো)
    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        paymentURL: `http://localhost:8000/ssl/${order.id}`,
        message: 'Order created successfully. Proceed to payment.',
      },
    });
  } catch (error) {
    logger.error('Order creation failed:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Order creation failed',
    });
  }
};