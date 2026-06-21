import crypto from "crypto";

export function hashFile(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function hashString(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}
