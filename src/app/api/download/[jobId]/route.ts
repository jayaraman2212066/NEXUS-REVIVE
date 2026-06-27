import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile, fileExists } from "@/lib/storage";
import { getMimeType } from "@/generators";
import { TargetFormat } from "@/types/conversion.types";
import { getSessionUser } from "@/lib/session";
import { getOrCreateAnonSession, checkAndIncrementDownload, FREE_DOWNLOAD_LIMIT } from "@/lib/anon-session";

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId;

    const job = await prisma.conversionJob.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.status !== "completed") return NextResponse.json({ error: "Job not completed yet" }, { status: 400 });
    if (!job.outputPath && !job.outputFileData) return NextResponse.json({ error: "Output file not found" }, { status: 404 });

    const sessionUser = await getSessionUser(req);
    const isPro = sessionUser?.isPro ?? false;

    // Gate 1: Pro-only formats (.docx, .pdf, .xlsx)
    const proFormats: TargetFormat[] = ["docx", "pdf", "xlsx"];
    if (proFormats.includes(job.targetFormat as TargetFormat) && !isPro) {
      return NextResponse.json({
        error: "pro_required",
        message: "Upgrade to Pro to download .docx, .pdf, and .xlsx files",
        checkoutUrl: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL,
      }, { status: 402 });
    }

    // Gate 2: Anon free download limit (3 total)
    if (!sessionUser) {
      const anonSessionId = await getOrCreateAnonSession(req);
      const check = await checkAndIncrementDownload(anonSessionId);

      if (!check.allowed) {
        return NextResponse.json({
          error: "download_limit",
          message: `You've used all ${FREE_DOWNLOAD_LIMIT} free downloads. Create a free account or upgrade to Pro for more.`,
          downloadsUsed: FREE_DOWNLOAD_LIMIT,
          checkoutUrl: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL,
        }, { status: 402 });
      }
    }

    // Try filesystem first, fallback to database
    let fileBuffer: Buffer;
    const filePathExists = job.outputPath && await fileExists(job.outputPath);
    
    if (filePathExists) {
      fileBuffer = await readFile(job.outputPath);
      console.log(`✅ Downloaded from filesystem: ${job.outputPath}`);
    } else if (job.outputFileData) {
      fileBuffer = Buffer.from(job.outputFileData);
      console.log(`✅ Downloaded from database: ${job.originalName} (${fileBuffer.length} bytes)`);
    } else {
      throw new Error("Output file not available in filesystem or database");
    }

    await prisma.conversionJob.update({
      where: { id: jobId },
      data: { downloadCount: { increment: 1 } },
    });

    const extension = job.outputPath.split(".").pop() || "bin";
    const baseName = job.originalName.replace(/\.[^.]+$/, "");
    const fileName = `${baseName}_recovered.${extension}`;
    const mimeType = getMimeType(job.targetFormat as TargetFormat);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
        "X-Download-Remaining": isPro ? "unlimited" : "see-account",
      },
    });

  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
