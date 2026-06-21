import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getOrCreateAnonSession, checkAndIncrementPreview, FREE_PREVIEW_LIMIT } from "@/lib/anon-session";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId;

    const job = await prisma.conversionJob.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // Auth check
    const sessionUser = await getSessionUser(req);
    const isPro = sessionUser?.isPro ?? false;

    // Anon preview limit
    if (!sessionUser) {
      const anonSessionId = await getOrCreateAnonSession(req);
      const check = await checkAndIncrementPreview(anonSessionId);

      if (!check.allowed) {
        return NextResponse.json({
          error: "preview_limit",
          message: `You've used all ${FREE_PREVIEW_LIMIT} free previews. Upgrade to Pro for unlimited access.`,
          previewsUsed: FREE_PREVIEW_LIMIT,
          checkoutUrl: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL,
        }, { status: 402 });
      }

      const response = NextResponse.json({
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        currentStage: job.currentStage,
        previewText: job.previewText,
        previewHtml: job.previewHtml,
        metadata: job.metadataJson ? JSON.parse(job.metadataJson) : null,
        processingMs: job.processingMs,
        previewsRemaining: check.remaining,
      });

      // Ensure cookie is set
      response.cookies.set("anon_sid", anonSessionId, {
        httpOnly: true, sameSite: "lax", path: "/",
        maxAge: 31536000, secure: process.env.NODE_ENV === "production",
      });
      return response;
    }

    // Logged-in user (free or pro) — unlimited previews
    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      currentStage: job.currentStage,
      previewText: job.previewText,
      previewHtml: job.previewHtml,
      metadata: job.metadataJson ? JSON.parse(job.metadataJson) : null,
      processingMs: job.processingMs,
      previewsRemaining: null, // unlimited
    });

  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json({ error: "Failed to get preview" }, { status: 500 });
  }
}
