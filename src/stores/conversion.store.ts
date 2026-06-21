import { create } from "zustand";

export interface JobData {
  jobId: string;
  format: string;
  extension: string;
  size: number;
  healthScore: number;
  corruptionType: string;
  repairability: string;
  cached?: boolean;
  detectedMime?: string;
  confidence?: number;
}

export type PaywallType = "preview_limit" | "download_limit" | "pro_required" | "daily_limit" | null;

interface ConversionStore {
  file: File | null;
  jobData: JobData | null;
  previewText: string;
  previewHtml: string;
  targetFormat: string;
  uploading: boolean;
  processing: boolean;
  error: string;
  previewsRemaining: number | null;
  downloadsRemaining: number | null;
  paywallType: PaywallType;
  paywallMessage: string;
  setFile: (f: File | null) => void;
  setJobData: (d: JobData | null) => void;
  setPreview: (text: string, html?: string, previewsRemaining?: number | null) => void;
  setTargetFormat: (fmt: string) => void;
  setUploading: (v: boolean) => void;
  setProcessing: (v: boolean) => void;
  setError: (msg: string) => void;
  setPaywall: (type: PaywallType, message?: string) => void;
  reset: () => void;
}

const INITIAL: Omit<ConversionStore, keyof { [K in keyof ConversionStore as ConversionStore[K] extends Function ? K : never]: true }> = {
  file: null,
  jobData: null,
  previewText: "",
  previewHtml: "",
  targetFormat: "txt",
  uploading: false,
  processing: false,
  error: "",
  previewsRemaining: null,
  downloadsRemaining: null,
  paywallType: null,
  paywallMessage: "",
};

export const useConversionStore = create<ConversionStore>((set) => ({
  ...INITIAL,
  file: null,
  jobData: null,
  previewText: "",
  previewHtml: "",
  targetFormat: "txt",
  uploading: false,
  processing: false,
  error: "",
  previewsRemaining: null,
  downloadsRemaining: null,
  paywallType: null,
  paywallMessage: "",
  setFile: (file) => set({ file }),
  setJobData: (jobData) => set({ jobData }),
  setPreview: (previewText, previewHtml = "", previewsRemaining = null) =>
    set({ previewText, previewHtml, previewsRemaining }),
  setTargetFormat: (targetFormat) => set({ targetFormat }),
  setUploading: (uploading) => set({ uploading }),
  setProcessing: (processing) => set({ processing }),
  setError: (error) => set({ error }),
  setPaywall: (paywallType, paywallMessage = "") => set({ paywallType, paywallMessage }),
  reset: () => set({
    file: null, jobData: null, previewText: "", previewHtml: "",
    targetFormat: "txt", uploading: false, processing: false,
    error: "", previewsRemaining: null, downloadsRemaining: null,
    paywallType: null, paywallMessage: "",
  }),
}));
