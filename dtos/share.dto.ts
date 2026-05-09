/**
 * Share DTOs — khớp BE: POST /api/shares/message, POST /api/shares/repost
 * Reference: FE-SHARE-INTEGRATION-GUIDE.md
 */

import type { PaginationDto } from "./common.dto";
import type { PostResponseDto } from "./post.dto";

// ─── DM Share ─────────────────────────────────────────────────────────────────

export interface SendDMShareRequestDto {
  postId: string;
  /** 1..10 userIds; client cần validate trước khi gọi. */
  recipientIds: string[];
  /** max 2000 ký tự */
  message?: string;
}

export interface SendDMShareSuccessDto {
  postId: string;
  recipientIds: string[];
  sentCount: number;
}

// ─── Repost ───────────────────────────────────────────────────────────────────

export interface RepostRequestDto {
  postId: string;
  /** max 2000 ký tự */
  comment?: string;
}

export interface RepostSuccessDto {
  repostId: string;
  postId: string;
  comment?: string;
  /** ISO */
  createdAt: string;
}

// ─── Repost listing (profile tab) ────────────────────────────────────────────

/**
 * 1 repost item — thường là wrapper của post gốc + comment + thời điểm repost.
 * BE shape có thể khác; service sẽ normalize.
 */
export interface RepostItemDto {
  /** id của repost (không phải post gốc) */
  repostId: string;
  /** id của user đã repost (chủ profile đang xem) */
  authorId: string;
  comment?: string;
  /** ISO time of the repost action */
  createdAt: string;
  /** Post gốc — đã normalize sang `PostResponseDto`. */
  post: PostResponseDto;
}

export interface PaginatedRepostsDto {
  reposts: RepostItemDto[];
  pagination: Pick<PaginationDto, "page" | "limit" | "total" | "hasMore">;
}

// ─── Realtime payload (Socket.IO /notifications) ─────────────────────────────

export type ShareNotificationType = "dm_share" | "repost";

export interface ShareNotificationPayload {
  type: ShareNotificationType;
  shareId: string;
  postId: string;
  actor: {
    id: string;
    name?: string;
    avatar?: string;
  };
  recipientId: string;
  /** DM message hoặc comment quote-repost */
  message?: string;
  /** ISO */
  createdAt: string;
}

// ─── Error code constants ─────────────────────────────────────────────────────

export const SHARE_ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  DTO_VALIDATION_ERROR: "DTO_VALIDATION_ERROR",
  POST_NOT_FOUND: "POST_NOT_FOUND",
  RECIPIENTS_LIMIT_EXCEEDED: "RECIPIENTS_LIMIT_EXCEEDED",
  RECIPIENT_SELF_INVALID: "RECIPIENT_SELF_INVALID",
  RECIPIENT_NOT_FRIEND: "RECIPIENT_NOT_FRIEND",
  SHARE_RATE_LIMIT_EXCEEDED: "SHARE_RATE_LIMIT_EXCEEDED",
  REPOST_OWN_POST_FORBIDDEN: "REPOST_OWN_POST_FORBIDDEN",
  REPOST_DUPLICATED: "REPOST_DUPLICATED",
} as const;

export type ShareErrorCode =
  (typeof SHARE_ERROR_CODES)[keyof typeof SHARE_ERROR_CODES];

/** Error throw từ share.service mang theo `code` để screen tinh chỉnh UX (xem bảng §3 guide). */
export class ShareApiError extends Error {
  code?: ShareErrorCode | string;

  constructor(message: string, code?: ShareErrorCode | string) {
    super(message);
    this.name = "ShareApiError";
    this.code = code;
  }
}
