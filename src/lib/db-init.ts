import { prisma } from "./prisma";

let dbInitialized = false;

export async function ensureDatabase() {
  if (dbInitialized) return;

  try {
    // Test connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    dbInitialized = true;
    console.log("✅ Database ready");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}
