"use client";

import { FileText } from "lucide-react";
import { useConversionStore } from "@/stores/conversion.store";

export function FileCard() {
  const { file, jobData } = useConversionStore();
  if (!jobData) return null;

  const score = jobData.healthScore ?? 0;
  const healthColor = score > 85 ? "#00FF88" : score > 65 ? "#FFD700" : "#FF3366";
  const healthLabel = score > 85 ? "Healthy" : score > 65 ? "Repairable" : "Damaged";

  return (
    <div className="flex items-start gap-4 mb-4">
      <FileText className="w-8 h-8 text-[#00D4FF] flex-shrink-0 mt-1" />
      <div className="flex-1">
        <h3 className="text-xl font-bold text-[#E0EFFF] mb-3 truncate">{file?.name}</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-[#7096B8]">Format: </span>
            <span className="text-[#E0EFFF] font-medium">{jobData.format}</span>
            {(jobData as any).confidence && (
              <span className="text-[#3A5570] text-xs ml-1">({Math.round((jobData as any).confidence * 100)}%)</span>
            )}
          </div>
          <div>
            <span className="text-[#7096B8]">Size: </span>
            <span className="text-[#E0EFFF] font-medium">{(jobData.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#7096B8]">Health: </span>
            <span className="font-bold" style={{ color: healthColor }}>{score}/100</span>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${healthColor}20`, color: healthColor }}>{healthLabel}</span>
          </div>
          <div>
            <span className="text-[#7096B8]">Repairability: </span>
            <span className="text-[#00D4FF] capitalize font-medium">{jobData.repairability}</span>
          </div>
          {jobData.corruptionType && jobData.corruptionType !== "none" && (
            <div className="col-span-2">
              <span className="text-[#7096B8]">Corruption: </span>
              <span className="text-[#FFD700] capitalize">{jobData.corruptionType.replace(/_/g, " ")}</span>
            </div>
          )}
          {(jobData as any).detectedMime && (
            <div className="col-span-2">
              <span className="text-[#7096B8]">MIME: </span>
              <span className="text-[#3A5570] text-xs font-mono">{(jobData as any).detectedMime}</span>
            </div>
          )}
        </div>

        {/* Health bar */}
        <div className="mt-3 h-1.5 bg-[#0A1628] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: `linear-gradient(90deg, ${healthColor}88, ${healthColor})` }}
          />
        </div>
      </div>
    </div>
  );
}
