import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development due to hot reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma Client configuration for Supabase
// Uses Supabase's environment variables in priority order:
// 1. POSTGRES_PRISMA_URL - Best for Prisma (already configured for connection pooling)
// 2. POSTGRES_URL - Supabase connection pooling URL
// 3. DATABASE_URL - Fallback for backwards compatibility
function getDatabaseUrl(): string {
  // Priority 1: Use Supabase's Prisma-specific URL (best for Prisma)
  if (process.env.POSTGRES_PRISMA_URL) {
    return process.env.POSTGRES_PRISMA_URL;
  }
  
  // Priority 2: Use Supabase's connection pooling URL
  if (process.env.POSTGRES_URL) {
    const url = process.env.POSTGRES_URL;
    // Ensure pgbouncer=true is set for connection pooling
    if (url.includes("pooler") && !url.includes("pgbouncer=true")) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}pgbouncer=true`;
    }
    return url;
  }
  
  // Priority 3: Fallback to DATABASE_URL (for backwards compatibility)
  const url = process.env.DATABASE_URL || "";
  if (url.includes("pooler") && !url.includes("pgbouncer=true")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}pgbouncer=true`;
  }
  return url;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
