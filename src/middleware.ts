import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Extend globalThis type
declare global {
  var __storage_init: boolean | undefined;
}

export function middleware(request: NextRequest) {
  // Initialize storage dirs on first request in serverless
  if (process.env.VERCEL && typeof globalThis.__storage_init === "undefined") {
    globalThis.__storage_init = true;
    
    try {
      const fs = require("fs");
      const dirs = [
        process.env.STORAGE_PATH || "/tmp/storage",
        process.env.TEMP_PATH || "/tmp/storage/tmp",
        process.env.OUTPUT_PATH || "/tmp/storage/output",
        process.env.AI_MODELS_PATH || "/tmp/storage/ai-models",
      ];
      
      dirs.forEach((dir) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });
    } catch (err) {
      console.warn("Storage init warning:", err);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
