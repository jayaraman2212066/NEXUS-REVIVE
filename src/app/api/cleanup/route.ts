import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFile, fileExists } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await prisma.conversionJob.findMany({
    where: { expiresAt: { lte: new Date() } },
    select: { id: true, inputPath: true, outputPath: true },
  });

  let deleted = 0;
  for (const job of expired) {
    if (job.inputPath && (await fileExists(job.inputPath))) await deleteFile(job.inputPath);
    if (job.outputPath && (await fileExists(job.outputPath))) await deleteFile(job.outputPath);
    await prisma.conversionJob.delete({ where: { id: job.id } });
    deleted++;
  }

  return NextResponse.json({ deleted, timestamp: new Date().toISOString() });
}
