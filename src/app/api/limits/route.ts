import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getAnonSession, FREE_PREVIEW_LIMIT, FREE_DOWNLOAD_LIMIT, FREE_CONVERSIONS_PER_DAY } from "@/lib/anon-session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionUser = await getSessionUser(req);

  if (sessionUser) {
    return NextResponse.json({
      isPro: sessionUser.isPro,
      previews: { used: 0, limit: null, unlimited: true },
      downloads: { used: 0, limit: null, unlimited: true },
      conversions: { used: 0, limit: null, unlimited: true },
    });
  }

  const anonSession = await getAnonSession(req);
  if (!anonSession) {
    return NextResponse.json({
      isPro: false,
      previews: { used: 0, limit: FREE_PREVIEW_LIMIT, remaining: FREE_PREVIEW_LIMIT },
      downloads: { used: 0, limit: FREE_DOWNLOAD_LIMIT, remaining: FREE_DOWNLOAD_LIMIT },
      conversions: { used: 0, limit: FREE_CONVERSIONS_PER_DAY, remaining: FREE_CONVERSIONS_PER_DAY },
    });
  }

  return NextResponse.json({
    isPro: false,
    previews: {
      used: anonSession.previewsUsed,
      limit: FREE_PREVIEW_LIMIT,
      remaining: Math.max(0, FREE_PREVIEW_LIMIT - anonSession.previewsUsed),
    },
    downloads: {
      used: anonSession.downloadsUsed,
      limit: FREE_DOWNLOAD_LIMIT,
      remaining: Math.max(0, FREE_DOWNLOAD_LIMIT - anonSession.downloadsUsed),
    },
    conversions: {
      used: anonSession.conversionsToday,
      limit: FREE_CONVERSIONS_PER_DAY,
      remaining: Math.max(0, FREE_CONVERSIONS_PER_DAY - anonSession.conversionsToday),
    },
  });
}
