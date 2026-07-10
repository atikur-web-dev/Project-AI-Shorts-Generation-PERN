// Backend/src/test-db.ts
import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully!');
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    });
    console.log('Test user created:', user);
    
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();