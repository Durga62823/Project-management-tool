import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Check if we're in Edge Runtime (middleware)
const isEdgeRuntime = typeof EdgeRuntime !== "undefined";

export const prisma = isEdgeRuntime
  ? ({} as PrismaClient) // Return empty object in edge runtime
  : (globalForPrisma.prisma ??
    new PrismaClient({
      log: ["error"],
    }));

if (process.env.NODE_ENV !== "production" && !isEdgeRuntime) {
  globalForPrisma.prisma = prisma;
}
