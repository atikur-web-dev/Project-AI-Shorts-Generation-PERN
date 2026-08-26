// Backend/src/services/searchHistory.service.ts
import { prisma } from '../lib/prisma.js';

export const saveSearchHistory = async (
  userId: string,
  query: string,
  type: string,
  filters?: any
) => {
  return prisma.searchHistory.create({
    data: {
      userId,
      query,
      type,
      filters: filters || null,
    },
  });
};

export const getSearchHistory = async (userId: string) => {
  return prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
};

export const clearSearchHistory = async (userId: string) => {
  return prisma.searchHistory.deleteMany({
    where: { userId },
  });
};