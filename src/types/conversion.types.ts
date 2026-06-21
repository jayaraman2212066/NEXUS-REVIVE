export type ConversionStatus = 
  | "queued" 
  | "detecting" 
  | "repairing" 
  | "extracting" 
  | "enhancing" 
  | "generating" 
  | "completed" 
  | "failed";

export type TargetFormat = "docx" | "pdf" | "xlsx" | "html" | "md" | "txt";

export type CorruptionType = 
  | "none" 
  | "header_damage" 
  | "stream_corruption" 
  | "truncated" 
  | "encoding_mismatch";

export type Repairability = "excellent" | "good" | "partial" | "unlikely";

export interface ConversionJob {
  id: string;
  userId?: string;
  anonSessionId?: string;
  originalName: string;
  originalSize: number;
  originalFormat: string;
  originalExtension: string;
  originalHash: string;
  targetFormat: TargetFormat;
  status: ConversionStatus;
  progress: number;
  currentStage: string;
  currentStageDetail?: string;
  errorMessage?: string;
  errorCode?: string;
  inputPath: string;
  outputPath?: string;
  previewText?: string;
  previewHtml?: string;
  fileHealthScore?: number;
  corruptionType?: CorruptionType;
  repairability?: Repairability;
  encodingDetected?: string;
  languageDetected?: string;
  documentType?: string;
  metadataJson?: string;
  processingMs?: number;
  aiEnhanced: boolean;
  formattingScore?: number;
  downloadCount: number;
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
}

export interface ProgressUpdate {
  stage: string;
  progress: number;
  message: string;
  detail?: string;
  estimatedMs?: number;
}
