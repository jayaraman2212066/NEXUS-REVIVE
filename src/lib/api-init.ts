/**
 * API Initialization Utility
 * Ensures database and storage are ready before processing requests
 */

import { ensureDatabase } from "./db-init";
import { ensureDirectories } from "./storage";

let apiInitialized = false;

export async function initializeAPI() {
  if (apiInitialized) return;
  
  try {
    // Initialize in parallel for faster startup
    await Promise.all([
      ensureDatabase(),
      ensureDirectories(),
    ]);
    
    apiInitialized = true;
    console.log("✅ API fully initialized");
  } catch (error) {
    console.error("❌ API initialization failed:", error);
    throw new Error("System initialization failed. Please try again.");
  }
}

// Helper to wrap API routes with initialization
export function withAPIInit<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    await initializeAPI();
    return handler(...args);
  }) as T;
}
