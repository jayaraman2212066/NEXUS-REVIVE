export interface FormatSignature {
  bytes: number[];
  offset?: number;
  mask?: number[];
  format: string;
  version: string;
  mime: string;
  category: "document" | "spreadsheet" | "presentation" | "database" | "email" | "image" | "archive" | "text";
}

export interface DetectedFormat {
  format: string;
  version: string;
  mime: string;
  category: string;
  confidence: number;
  extension: string;
}
