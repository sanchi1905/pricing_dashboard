import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Tenant-scoped query helpers
export function tenantWhere(orgId: string) {
  return { orgId };
}

export function withTenant<T extends Record<string, unknown>>(orgId: string, where: T) {
  return { ...where, orgId };
}
