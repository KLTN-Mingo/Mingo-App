import { PaginationDto, PaginationParams } from "./common.dto";

// ─── Enums ─────────────────────────────────────────────────────────────────────

export enum ReportEntityType {
  POST = "post",
  COMMENT = "comment",
  USER = "user",
}

export enum ReportReason {
  SPAM = "spam",
  HARASSMENT = "harassment",
  HATE_SPEECH = "hate_speech",
  INAPPROPRIATE = "inappropriate",
  SCAM = "scam",
  COPYRIGHT = "copyright",
  VIOLENCE = "violence",
  MISINFORMATION = "misinformation",
  OTHER = "other",
}

export enum ReportStatus {
  PENDING = "pending",
  RESOLVED = "resolved",
  REJECTED = "rejected",
}

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export interface CreateReportRequestDto {
  entityType: ReportEntityType;
  entityId: string;
  reason: ReportReason;
  description?: string;
}

export interface CreateUserReportRequestDto {
  reason: ReportReason;
  description?: string;
}

export interface GetReportsQueryDto extends PaginationParams {
  status?: ReportStatus;
  entityType?: ReportEntityType;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export interface ReportResponseDto {
  id: string;
  reporterId: string;
  entityType: ReportEntityType;
  entityId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface PaginatedReportsDto {
  reports: ReportResponseDto[];
  pagination: PaginationDto;
}

// ─── Labels ────────────────────────────────────────────────────────────────────

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  [ReportReason.SPAM]: "Spam / Quảng cáo",
  [ReportReason.HARASSMENT]: "Quấy rối",
  [ReportReason.HATE_SPEECH]: "Ngôn ngữ thù ghét",
  [ReportReason.INAPPROPRIATE]: "Nội dung không phù hợp",
  [ReportReason.SCAM]: "Lừa đảo",
  [ReportReason.COPYRIGHT]: "Vi phạm bản quyền",
  [ReportReason.VIOLENCE]: "Bạo lực",
  [ReportReason.MISINFORMATION]: "Thông tin sai lệch",
  [ReportReason.OTHER]: "Khác",
};
