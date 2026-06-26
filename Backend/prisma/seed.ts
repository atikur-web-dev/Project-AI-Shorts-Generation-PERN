// Backend/prisma/seed.ts
import { PrismaClient } from '../generated/prisma/client';
const prisma = new PrismaClient();

async function main() {
  const plans = [
    { name: 'free', price: 0, credits: 30 },
    { name: 'basic', price: 499, credits: 100 },
    { name: 'premium', price: 999, credits: 300 },
  ];

  for (const plan of plans) {
    const existingPlan = await prisma.userSubscription.findFirst({
      where: { price: plan.price, credits: plan.credits },
    });

    if (existingPlan) {
      await prisma.userSubscription.update({
        where: { id: existingPlan.id },
        data: plan,
      });
    } else {
      await prisma.userSubscription.create({
        data: {
          ...plan,
          user: {
            connect: { id: '1' },
          },
        },
      });
    }
  }

  console.log('Subscription plans seeded');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());