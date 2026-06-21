import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processFile } from "@/processors";
import { generateOutput, getFileExtension } from "@/generators";
import { saveFile } from "@/lib/storage";
import { addToQueue } from "@/lib/queue";
import { TargetFormat } from "@/types/conversion.types";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { jobIds, targetFormat } = (await req.json()) as {
      jobIds: string[];
      targetFormat: TargetFormat;
    };

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json({ error: "jobIds array required" }, { status: 400 });
    }

    const maxBatch = parseInt(process.env.MAX_BATCH_FILES_PRO || "50");
    if (jobIds.length > maxBatch) {
      return NextResponse.json(
        { error: `Batch limit is ${maxBatch} files (Pro)` },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      jobIds.map((jobId) =>
        addToQueue(async () => {
          const job = await prisma.conversionJob.findUnique({ where: { id: jobId } });
          if (!job) throw new Error(`Job ${jobId} not found`);

          await prisma.conversionJob.update({
            where: { id: jobId },
            data: { status: "extracting", progress: 20, targetFormat },
          });

          const content = await processFile(job.inputPath, job.originalFormat);
          const buffer = await generateOutput(content, targetFormat, job.originalName);
          const ext = getFileExtension(targetFormat);
          const outputPath = await saveFile(buffer, `${job.originalHash}_output.${ext}`, "output");

          await prisma.conversionJob.update({
            where: { id: jobId },
            data: {
              status: "completed",
              progress: 100,
              outputPath,
              previewText: content.text.substring(0, 5000),
              completedAt: new Date(),
            },
          });

          return { jobId, success: true };
        })
      )
    );

    const summary = results.map((r, i) =>
      r.status === "fulfilled"
        ? r.value
        : { jobId: jobIds[i], success: false, error: (r.reason as Error).message }
    );

    return NextResponse.json({ results: summary });
  } catch (error) {
    console.error("Batch error:", error);
    return NextResponse.json({ error: "Batch conversion failed" }, { status: 500 });
  }
}
