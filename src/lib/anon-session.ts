import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashString } from "@/lib/hash";

export const FREE_PREVIEW_LIMIT = 3;
export const FREE_DOWNLOAD_LIMIT = 3;
export const FREE_CONVERSIONS_PER_DAY = 10;

function todayBucket(): string {
  return new Date().toISOString().slice(0, 10);
}

function getIpHash(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return hashString(ip).slice(0, 16);
}

export async function getOrCreateAnonSession(req: NextRequest, res?: NextResponse): Promise<string> {
  const cookieId = req.cookies.get("anon_sid")?.value;

  if (cookieId) {
    // Verify it actually exists in DB
    const existing = await prisma.anonSession.findUnique({ where: { id: cookieId } });
    if (existing) {
      await prisma.anonSession.update({ where: { id: cookieId }, data: { lastSeenAt: new Date() } });
      return cookieId;
    }
  }

  const ipHash = getIpHash(req);
  const today = todayBucket();

  const session = await prisma.anonSession.create({
    data: { ipHash, dayBucket: today },
  });

  if (res) {
    res.cookies.set("anon_sid", session.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      secure: process.env.NODE_ENV === "production",
    });
  }

  return session.id;
}

export async function getAnonSession(req: NextRequest) {
  const cookieId = req.cookies.get("anon_sid")?.value;
  if (!cookieId) return null;
  return prisma.anonSession.findUnique({ where: { id: cookieId } });
}

export async function checkAndIncrementConversion(sessionId: string): Promise<{ allowed: boolean; reason?: string }> {
  const session = await prisma.anonSession.findUnique({ where: { id: sessionId } });
  if (!session) return { allowed: false, reason: "Session not found" };

  const today = todayBucket();

  // Reset daily counter if new day
  if (session.dayBucket !== today) {
    await prisma.anonSession.update({
      where: { id: sessionId },
      data: { conversionsToday: 0, dayBucket: today },
    });
    session.conversionsToday = 0;
  }

  if (session.conversionsToday >= FREE_CONVERSIONS_PER_DAY) {
    return { allowed: false, reason: `Daily limit of ${FREE_CONVERSIONS_PER_DAY} conversions reached. Upgrade to Pro for unlimited.` };
  }

  await prisma.anonSession.update({
    where: { id: sessionId },
    data: { conversionsToday: { increment: 1 } },
  });

  return { allowed: true };
}

export async function checkAndIncrementPreview(sessionId: string): Promise<{ allowed: boolean; remaining: number }> {
  const session = await prisma.anonSession.findUnique({ where: { id: sessionId } });
  if (!session) return { allowed: false, remaining: 0 };

  if (session.previewsUsed >= FREE_PREVIEW_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  await prisma.anonSession.update({
    where: { id: sessionId },
    data: { previewsUsed: { increment: 1 } },
  });

  return { allowed: true, remaining: FREE_PREVIEW_LIMIT - session.previewsUsed - 1 };
}

export async function checkAndIncrementDownload(sessionId: string): Promise<{ allowed: boolean; remaining: number }> {
  const session = await prisma.anonSession.findUnique({ where: { id: sessionId } });
  if (!session) return { allowed: false, remaining: 0 };

  if (session.downloadsUsed >= FREE_DOWNLOAD_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  await prisma.anonSession.update({
    where: { id: sessionId },
    data: { downloadsUsed: { increment: 1 } },
  });

  return { allowed: true, remaining: FREE_DOWNLOAD_LIMIT - session.downloadsUsed - 1 };
}
