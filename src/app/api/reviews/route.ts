import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashString } from "@/lib/hash";
import { getSessionUser } from "@/lib/session";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

function getIpHash(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return hashString(ip).slice(0, 24);
}

// GET — return featured (non-seeded real) reviews + seed featured reviews, paginated
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(20, parseInt(searchParams.get("limit") || "12"));
  const featured = searchParams.get("featured") === "true";

  if (featured) {
    // Return the 20 hand-crafted featured reviews for homepage display
    const reviews = await prisma.review.findMany({
      where: { isSeeded: true, stars: { gte: 4 }, body: { not: { in: ["Absolute", "Really solid", "Works well"] } } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, stars: true, body: true, displayName: true, location: true, fileFormat: true, createdAt: true },
    });
    return NextResponse.json({ reviews });
  }

  const skip = (page - 1) * limit;

  // Prioritize real user reviews first, then featured seeds
  const [realReviews, seedFeatured] = await Promise.all([
    prisma.review.findMany({
      where: { isSeeded: false },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: { id: true, stars: true, body: true, displayName: true, location: true, fileFormat: true, createdAt: true },
    }),
    prisma.review.findMany({
      where: { isSeeded: true, stars: 5, body: { contains: "Absolutely" } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, stars: true, body: true, displayName: true, location: true, fileFormat: true, createdAt: true },
    }),
  ]);

  // Mix: real first, fill with seeded if needed
  const reviews = realReviews.length >= limit
    ? realReviews
    : [...realReviews, ...seedFeatured].slice(0, limit);

  return NextResponse.json({ reviews, page, limit });
}

// POST — submit a review (one per IP session)
export async function POST(req: NextRequest) {
  try {
    const ipHash = getIpHash(req);
    const sessionUser = await getSessionUser(req);
    const anonSid = req.cookies.get("anon_sid")?.value || "";

    // Deduplicate: one review per IP hash
    const existing = await prisma.review.findFirst({
      where: { ipHash, isSeeded: false },
    });
    if (existing) {
      return NextResponse.json({ error: "already_reviewed", message: "You've already submitted a review." }, { status: 409 });
    }

    const body = await req.json();
    const { stars, reviewBody, displayName } = body as {
      stars: number;
      reviewBody: string;
      displayName: string;
    };

    if (!stars || stars < 1 || stars > 5) {
      return NextResponse.json({ error: "Invalid star rating" }, { status: 400 });
    }
    if (!reviewBody || reviewBody.trim().length < 10) {
      return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
    }
    if (!displayName || displayName.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
    }

    // Sanitize
    const cleanBody = reviewBody.trim().substring(0, 500);
    const cleanName = displayName.trim().substring(0, 40);

    const review = await prisma.review.create({
      data: {
        stars,
        body: cleanBody,
        displayName: cleanName,
        isSeeded: false,
        ipHash,
        anonSessionId: anonSid,
        userId: sessionUser?.id ?? null,
      },
    });

    // Mark anon session as reviewed
    if (anonSid) {
      await prisma.anonSession.updateMany({
        where: { id: anonSid },
        data: { hasReviewed: true },
      });
    }

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
