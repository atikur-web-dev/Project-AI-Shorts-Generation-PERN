// Backend/src/services/adminLog.service.ts
import { prisma } from '../lib/prisma.js';

export const createAdminLog = async (
  adminId: string,
  action: string,
  targetId?: string,
  details?: any
) => {
  return prisma.adminLog.create({
    data: {
      adminId,
      action,
      targetId: targetId || null,
      details: details || null,
    },
  });
};