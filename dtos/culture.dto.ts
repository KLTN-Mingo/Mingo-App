// ─── Response DTOs ─────────────────────────────────────────────────────────────

export interface CultureTermDto {
  term: string;
  startIndex: number;
  endIndex: number;
  meaning: string;
  origin?: string;
  tone?: "tích cực" | "trung tính" | "hài hước" | "tiêu cực" | string;
  contextNote?: string;
}

export interface CultureTermsResponseDto {
  postId: string;
  terms: CultureTermDto[];
}

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export interface ReportTermRequestDto {
  term: string;
  reason?: string;
}
