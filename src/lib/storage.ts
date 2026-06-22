import fs from "fs/promises";
import path from "path";

// Vercel: use /tmp for ephemeral storage, local: use ./storage
const isVercel = process.env.VERCEL === "1";
const ROOT = isVercel ? "/tmp" : process.cwd();

const STORAGE_PATH = isVercel 
  ? "/tmp/storage" 
  : path.resolve(ROOT, process.env.STORAGE_PATH || "storage");
  
const TEMP_PATH = isVercel 
  ? "/tmp/storage/tmp" 
  : path.resolve(ROOT, process.env.TEMP_PATH || "storage/tmp");
  
const OUTPUT_PATH = isVercel 
  ? "/tmp/storage/output" 
  : path.resolve(ROOT, process.env.OUTPUT_PATH || "storage/output");

let directoriesInitialized = false;

export async function ensureDirectories() {
  if (directoriesInitialized) return;
  try {
    await fs.mkdir(STORAGE_PATH, { recursive: true });
    await fs.mkdir(TEMP_PATH, { recursive: true });
    await fs.mkdir(OUTPUT_PATH, { recursive: true });
    directoriesInitialized = true;
    console.log("✅ Storage directories ready");
  } catch (error) {
    console.error("❌ Storage initialization failed:", error);
    throw new Error("Storage system unavailable");
  }
}

export async function saveFile(buffer: Buffer, filename: string, type: "temp" | "output" = "temp"): Promise<string> {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error("Cannot save empty buffer");
    }
    
    await ensureDirectories();
    const basePath = type === "temp" ? TEMP_PATH : OUTPUT_PATH;
    const filePath = path.join(basePath, filename);
    await fs.writeFile(filePath, buffer);
    console.log(`✅ Saved file: ${filename} (${buffer.length} bytes) to ${basePath}`);
    return filePath;
  } catch (error) {
    console.error("File save error:", error);
    throw new Error(`Failed to save file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function readFile(filePath: string): Promise<Buffer> {
  try {
    const exists = await fileExists(filePath);
    if (!exists) {
      throw new Error(`File not found: ${filePath}`);
    }
    const buffer = await fs.readFile(filePath);
    console.log(`✅ Read file: ${filePath} (${buffer.length} bytes)`);
    return buffer;
  } catch (error) {
    console.error(`❌ Read file error: ${filePath}`, error);
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
