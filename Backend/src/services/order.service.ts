// Backend/src/services/order.service.ts
import { prisma } from '../lib/prisma.js';
import { logger } from '../config/logger.js';

export const createOrder = async (userId: string, subscriptionId: string) => {
  // 1. Subscription খুঁজে বের করো
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new Error('Subscription plan not found');
  }

  // 2. Order তৈরি করো
  const order = await prisma.order.create({
    data: {
      userId,
      subscriptionId,
      amount: subscription.price,
      status: 'pending',
    },
  });

  logger.info(`📦 Order created: ${order.id} for user ${userId}`);
  return order;
};

export const getOrderById = async (orderId: string) => {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      subscription: true,
    },
  });
};

export const updateOrderStatus = async (
  orderId: string,
  status: 'pending' | 'completed' | 'failed',
) => {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};