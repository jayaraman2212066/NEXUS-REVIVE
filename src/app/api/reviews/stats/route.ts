import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashString } from "@/lib/hash";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

function getIpHash(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return hashString(ip).slice(0, 24);
}

export async function GET(req: NextRequest) {
  const ipHash = getIpHash(req);

  const [aggregate, distribution, hasReviewed] = await Promise.all([
    prisma.review.aggregate({ _avg: { stars: true }, _count: { id: true } }),
    prisma.review.groupBy({
      by: ["stars"],
      _count: { id: true },
      orderBy: { stars: "desc" },
    }),
    prisma.review.findFirst({ where: { ipHash, isSeeded: false }, select: { id: true } }),
  ]);

  const total = aggregate._count.id;
  const avg = aggregate._avg.stars ?? 0;

  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const d of distribution) dist[d.stars] = d._count.id;

  return NextResponse.json({
    total,
    avg: Math.round(avg * 10) / 10,
    distribution: dist,
    hasReviewed: !!hasReviewed,
  });
}
