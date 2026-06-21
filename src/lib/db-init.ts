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
    console.error("❌ Database initialization failed:", error);
    
    // On Vercel, the database file might not exist yet
    if (process.env.VERCEL) {
      console.log("🔄 Attempting to initialize database on Vercel...");
      try {
        // Try to run migrations
        await prisma.$executeRaw`SELECT 1`;
        dbInitialized = true;
        console.log("✅ Database initialized successfully");
      } catch (retryError) {
        console.error("❌ Retry failed:", retryError);
        throw new Error("Database initialization failed on Vercel");
      }
    } else {
      throw error;
    }
  }
}
