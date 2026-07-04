// Backend/src/services/order.service.ts
import { prisma } from '../lib/prisma.js';
import { logger } from '../config/logger.js';

export const createOrder = async (userId: string, subscriptionId: string) => {
  // 1. Get subscription
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new Error('Subscription plan not found');
  }

  // 2. Create order
  const order = await prisma.order.create({
    data: {
      userId,
      subscriptionId,
      amount: subscription.price,
      status: 'pending',
    },
    include: {
      user: true,
      subscription: true,
    },
  });

  logger.info(`Order created: ${order.id} for user ${userId}`);
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
  transactionId?: string
) => {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      transactionId: transactionId ?? null,
    },
  });
};

export const completeOrder = async (orderId: string, transactionId: string) => {
  // 1. Update order status
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'completed',
      transactionId,
    },
    include: {
      subscription: true,
      user: true,
    },
  });

  // 2. Update user credits
  await prisma.userSubscription.upsert({
    where: { userId: order.userId },
    update: {
      credits: { increment: order.subscription.credits },
      subscriptionId: order.subscriptionId,
    },
    create: {
      userId: order.userId,
      subscriptionId: order.subscriptionId,
      credits: order.subscription.credits,
    },
  });

  logger.info(`Order completed: ${orderId}, Credits added: ${order.subscription.credits}`);
  return order;
};