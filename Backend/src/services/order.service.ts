// Backend/src/services/order.service.ts
import { prisma } from '../lib/prisma.js';
import { logger } from '../config/logger.js';

export const createOrder = async (userId: string, subscriptionId: string) => {
  // 1. Check if the Subscription exists or not
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
  // Use a database transaction block so that everything succeeds together or fails together
  return await prisma.$transaction(async (tx) => {
    
    // 1. Fetch current order state inside the transaction
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { subscription: true },
    });

    if (!existingOrder) {
      throw new Error(`Order ${orderId} not found`);
    }

    // 2. IDEMPOTENCY GUARD: If order is already completed, return it immediately
    // This stops concurrent IPN / Redirect requests from double-crediting accounts
    if (existingOrder.status === 'completed') {
      logger.warn(`Order ${orderId} is already completed. Skipping credit allocation.`);
      return existingOrder;
    }

    // 3. Update order status safely using the transaction client
    const updatedOrder = await tx.order.update({
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

    // 4. Update user credits safely using the transaction client
    await tx.userSubscription.upsert({
      where: { userId: updatedOrder.userId },
      update: {
        credits: { increment: updatedOrder.subscription.credits },
        subscriptionId: updatedOrder.subscriptionId,
      },
      create: {
        userId: updatedOrder.userId,
        subscriptionId: updatedOrder.subscriptionId,
        credits: updatedOrder.subscription.credits,
      },
    });

    logger.info(`Order completed securely: ${orderId}, Credits added: ${updatedOrder.subscription.credits}`);
    return updatedOrder;
  });
};
