// Backend/prisma/seed.ts
import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
 
  // Seed Subscription Plans
  const plans = [
    {
      name: "free",
      price: 0,
      credits: 30,
    },
    {
      name: "basic",
      price: 499,
      credits: 100,
    },
    {
      name: "premium",
      price: 999,
      credits: 300,
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.subscription.findUnique({
      where: {
        name: plan.name,
      },
    });

    if (existing) {
      await prisma.subscription.update({
        where: {
          id: existing.id,
        },
        data: {
          price: plan.price,
          credits: plan.credits,
        },
      });
    } else {
      await prisma.subscription.create({
        data: plan,
      });
    }
  }

  console.log("Subscription plans seeded successfully");

  
  // Seed Admin User
  const adminEmail = "atikuradmin@gmail.com";
  const adminPassword = "atikur123";

  // Hash admin password
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Super Admin",
        passwordHash,
        role: "ADMIN",
        loginType: "email",
      },
    });

    console.log("Admin user created successfully");
  } else {
    await prisma.user.update({
      where: {
        id: existingAdmin.id,
      },
      data: {
        name: "Super Admin",
        passwordHash,
        role: "ADMIN",
        loginType: "email",
      },
    });

    console.log("Admin user updated successfully");
  }

  console.log("Seeding completed successfully");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });