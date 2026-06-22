import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initializeAPI } from "@/lib/api-init";
import { detectFormat, calculateHealthScore } from "@/algorithms/magic-bytes";
import { hashFile } from "@/lib/hash";
import { saveFile } from "@/lib/storage";
import { getSessionUser } from "@/lib/session";
import { getOrCreateAnonSession } from "@/lib/anon-session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const res = NextResponse.next();

  try {
    // Ensure API is fully initialized (DB + Storage)
    await initializeAPI();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Determine user context
    const sessionUser = await getSessionUser(req);
    const isPro = sessionUser?.isPro ?? false;

    const maxSize = isPro
      ? parseInt(process.env.MAX_PRO_FILE_BYTES || "524288000")
      : parseInt(process.env.MAX_FREE_FILE_BYTES || "26214400");

    if (file.size > maxSize) {
      return NextResponse.json({
        error: isPro ? "File exceeds 500MB Pro limit" : "File exceeds 25MB free limit. Upgrade to Pro for 500MB.",
        maxSize,
        needsPro: !isPro,
      }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = hashFile(buffer);
    const detected = detectFormat(buffer, file.name);
    const { score: healthScore, corruptionType, repairability } = calculateHealthScore(buffer, detected);

    // Get or create anon session (set cookie on response)
    let anonSessionId: string | null = null;
    if (!sessionUser) {
      anonSessionId = await getOrCreateAnonSession(req);
    }

    // Cache hit — same file already converted
    const existingJob = await prisma.conversionJob.findFirst({
      where: { originalHash: hash, status: "completed" },
      orderBy: { createdAt: "desc" },
    });

    if (existingJob) {
      const response = NextResponse.json({
        jobId: existingJob.id,
        cached: true,
        format: existingJob.originalFormat,
        extension: existingJob.originalExtension,
        size: existingJob.originalSize,
        healthScore: existingJob.fileHealthScore,
        corruptionType: existingJob.corruptionType,
        repairability: existingJob.repairability,
        detectedMime: detected.mime,
        confidence: detected.confidence,
      });
      if (anonSessionId) response.cookies.set("anon_sid", anonSessionId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 31536000, secure: process.env.NODE_ENV === "production" });
      return response;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 200);
    const filePath = await saveFile(buffer, `${hash}_${safeName}`, "temp");

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(process.env.FILE_EXPIRY_HOURS || "24"));

    const job = await prisma.conversionJob.create({
      data: {
        originalName: file.name,
        originalSize: file.size,
        originalFormat: detected.format,
        originalExtension: detected.extension,
        originalHash: hash,
        targetFormat: "txt",
        inputPath: filePath,
        inputFileData: buffer,                    // Store in DB for Vercel
        fileHealthScore: healthScore,
        corruptionType,
        repairability,
        expiresAt,
        userId: sessionUser?.id ?? null,
        anonSessionId,
      },
    });

    const response = NextResponse.json({
      jobId: job.id,
      format: detected.format,
      extension: detected.extension,
      size: file.size,
      healthScore,
      corruptionType,
      repairability,
      detectedMime: detected.mime,
      confidence: detected.confidence,
    });

    if (anonSessionId) {
      response.cookies.set("anon_sid", anonSessionId, {
        httpOnly: true, sameSite: "lax", path: "/",
        maxAge: 31536000, secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
