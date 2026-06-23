import { prisma } from '../lib/prisma.js';
import { logger } from '../config/logger.js';

export class CreditService {
  static async checkCredits(userId: string, required: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userSubscription: true },
    });
    
    if (!user?.userSubscription) return false;
    return user.userSubscription.credits >= required;
  }

  static async deductCredits(userId: string, amount: number): Promise<void> {
    await prisma.userSubscription.update({
      where: { userId },
      data: { credits: { decrement: amount } },
    });
  }

  static async refundCredits(userId: string, amount: number): Promise<void> {
    await prisma.userSubscription.update({
      where: { userId },
      data: { credits: { increment: amount } },
    });
  }

  static async getCredits(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userSubscription: true },
    });
    return user?.userSubscription?.credits ?? 0;
  }
}