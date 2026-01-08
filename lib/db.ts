import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development due to hot reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma Client configuration for Supabase
// Vercel's auto-configured DATABASE_URL may not include ?pgbouncer=true
// This automatically adds it for pooler connections to fix prepared statement errors
function getDatabaseUrl(): string {
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
