import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDatabase } from "@/lib/db-init";
import { processFile } from "@/processors";
import { generateOutput, getFileExtension } from "@/generators";
import { saveFile } from "@/lib/storage";
import { TargetFormat } from "@/types/conversion.types";
import { getSessionUser } from "@/lib/session";
import { getOrCreateAnonSession, checkAndIncrementConversion } from "@/lib/anon-session";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

async function updateJob(id: string, data: object) {
  try { await prisma.conversionJob.update({ where: { id }, data }); }
  catch (e) { console.error("Job update failed:", e); }
}

export async function POST(req: NextRequest) {
  let jobId: string | undefined;

  try {
    // Ensure database is ready
    await ensureDatabase();
    const body = await req.json();
    const { jobId: reqJobId, targetFormat } = body as { jobId: string; targetFormat: TargetFormat };
    jobId = reqJobId;

    if (!jobId || !targetFormat) {
      return NextResponse.json({ error: "Missing jobId or targetFormat" }, { status: 400 });
    }

    // Auth context
    const sessionUser = await getSessionUser(req);
    const isPro = sessionUser?.isPro ?? false;

    // Anon rate limiting
    if (!sessionUser) {
      const anonSessionId = await getOrCreateAnonSession(req);
      const check = await checkAndIncrementConversion(anonSessionId);
      if (!check.allowed) {
        return NextResponse.json({
          error: "daily_limit",
          message: check.reason,
          checkoutUrl: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL,
        }, { status: 429 });
      }
    }

    const job = await prisma.conversionJob.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // Pro-only formats gate
    const proOnlyFormats: TargetFormat[] = ["docx", "pdf", "xlsx"];
    if (proOnlyFormats.includes(targetFormat) && !isPro) {
      return NextResponse.json({
        error: "pro_required",
        message: "Upgrade to Pro to convert to .docx, .pdf, or .xlsx",
        checkoutUrl: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL,
      }, { status: 402 });
    }

    const startTime = Date.now();

    await updateJob(jobId, { status: "detecting", currentStage: "Detecting & validating format", progress: 10, targetFormat });
    await updateJob(jobId, { status: "repairing", currentStage: "Repairing & extracting content", progress: 25 });

    const processed = await processFile(job.inputPath, job.originalFormat);
    if (!processed?.text) throw new Error("No content could be extracted from this file");

    await updateJob(jobId, {
      status: "enhancing",
      currentStage: "Enhancing recovered content",
      progress: 55,
      previewText: processed.text.substring(0, 5000),
      previewHtml: processed.html?.substring(0, 20000) ?? null,
      encodingDetected: processed.encoding ?? null,
      metadataJson: processed.metadata ? JSON.stringify(processed.metadata) : null,
    });

    await updateJob(jobId, { status: "generating", currentStage: "Generating output file", progress: 75 });

    const outputBuffer = await generateOutput(processed, targetFormat, job.originalName);
    if (!outputBuffer || outputBuffer.length === 0) throw new Error("Output generation produced empty file");

    const ext = getFileExtension(targetFormat);
    const outputPath = await saveFile(outputBuffer, `${job.originalHash}_${targetFormat}.${ext}`, "output");
    const processingMs = Date.now() - startTime;

    await updateJob(jobId, {
      status: "completed",
      currentStage: "Completed",
      progress: 100,
      outputPath,
      processingMs,
      completedAt: new Date(),
      aiEnhanced: ["PNG", "JPEG", "TIFF", "BMP", "GIF"].includes(job.originalFormat),
    });

    // Increment user total conversions
    if (sessionUser) {
      await prisma.user.update({
        where: { id: sessionUser.id },
        data: { totalConversions: { increment: 1 } },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      jobId,
      processingMs,
      wordCount: processed.wordCount ?? null,
      encoding: processed.encoding ?? null,
      pageCount: processed.pageCount ?? null,
    });

  } catch (error) {
    console.error("Conversion error:", error);
    const msg = error instanceof Error ? error.message : "Conversion failed";
    if (jobId) await updateJob(jobId, { status: "failed", currentStage: "Failed", errorMessage: msg, errorCode: "CONVERSION_ERROR" });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
