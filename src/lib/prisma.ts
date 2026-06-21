import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Graceful connection handling
if (process.env.NODE_ENV === "production") {
  prisma.$connect()
    .then(() => console.log("✅ Prisma connected"))
    .catch((err) => {
      console.error("❌ Prisma connection error:", err);
      // Continue anyway - let individual queries handle connection
    });
}
