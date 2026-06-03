import type {
  PaginatedRepostsDto,
  PostResponseDto,
  RepostItemDto,
  RepostRequestDto,
  RepostSuccessDto,
  SendDMShareRequestDto,
  SendDMShareSuccessDto,
} from "@/dtos";
import { ShareApiError } from "@/dtos";
import { apiRequest } from "@/services/api-client";

/** Theo guide §5: validate FE trước khi call. */
const MAX_RECIPIENTS = 10;
const MAX_MESSAGE_LEN = 2000;

class ShareService {
  /** POST /api/shares/message — DM share post tới 1..10 friends. */
  async sendDMShare(
    payload: SendDMShareRequestDto
  ): Promise<SendDMShareSuccessDto> {
    this.assertValidDmShare(payload);
    try {
      const data = await apiRequest<SendDMShareSuccessDto>("/shares/message", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return data;
    } catch (e) {
      throw this.toShareError(e, "Không gửi được tin nhắn chia sẻ");
    }
  }

  /** POST /api/shares/repost — repost (kèm comment optional). */
  async repost(payload: RepostRequestDto): Promise<RepostSuccessDto> {
    this.assertValidRepost(payload);
    try {
      const data = await apiRequest<RepostSuccessDto>("/shares/repost", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return data;
    } catch (e) {
      throw this.toShareError(e, "Không repost được bài viết");
    }
  }

  /**
   * GET /api/users/:userId/reposts (hoặc fallback) — danh sách reposts của 1 user.
   * BE trả `repostId` (id của bản ghi share) + post gốc; service sẽ normalize.
   */
  async getUserReposts(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedRepostsDto> {
    const params = new URLSearchParams({
      page: String(Math.max(1, page)),
      limit: String(Math.min(20, Math.max(1, limit))),
    });
    const raw = await apiRequest<unknown>(
      `/users/${encodeURIComponent(userId)}/reposts?${params.toString()}`
    );
    return this.normalizePaginatedReposts(raw, page, limit, userId);
  }

  // ─── validation ──────────────────────────────────────────────────────────────

  private assertValidDmShare(p: SendDMShareRequestDto) {
    if (!p.postId) throw new ShareApiError("Thiếu postId", "DTO_VALIDATION_ERROR");
    if (!Array.isArray(p.recipientIds) || p.recipientIds.length === 0) {
      throw new ShareApiError(
        "Vui lòng chọn ít nhất 1 người nhận",
        "DTO_VALIDATION_ERROR"
      );
    }
    if (p.recipientIds.length > MAX_RECIPIENTS) {
      throw new ShareApiError(
        `Chỉ được gửi tối đa ${MAX_RECIPIENTS} người`,
        "RECIPIENTS_LIMIT_EXCEEDED"
      );
    }
    if (new Set(p.recipientIds).size !== p.recipientIds.length) {
      throw new ShareApiError(
        "Danh sách người nhận có trùng lặp",
        "DTO_VALIDATION_ERROR"
      );
    }
    if (p.message && p.message.length > MAX_MESSAGE_LEN) {
      throw new ShareApiError(
        `Tin nhắn không vượt quá ${MAX_MESSAGE_LEN} ký tự`,
        "DTO_VALIDATION_ERROR"
      );
    }
  }

  private assertValidRepost(p: RepostRequestDto) {
    if (!p.postId) throw new ShareApiError("Thiếu postId", "DTO_VALIDATION_ERROR");
    if (p.comment && p.comment.length > MAX_MESSAGE_LEN) {
      throw new ShareApiError(
        `Comment không vượt quá ${MAX_MESSAGE_LEN} ký tự`,
        "DTO_VALIDATION_ERROR"
      );
    }
  }

  // ─── error mapping ──────────────────────────────────────────────────────────

  /**
   * `apiRequest` trả `Error(message)` từ JSON envelope.
   * Một số BE đính `error.code` ngay vào message hoặc body — fallback giữ message.
   */
  private toShareError(e: unknown, fallback: string): ShareApiError {
    if (e instanceof ShareApiError) return e;
    if (e instanceof Error) {
      const code = this.guessCodeFromMessage(e.message);
      return new ShareApiError(e.message || fallback, code);
    }
    return new ShareApiError(fallback);
  }

  private guessCodeFromMessage(msg: string): string | undefined {
    const m = msg.toUpperCase();
    if (m.includes("REPOST_DUPLICATED") || m.includes("ĐÃ REPOST")) {
      return "REPOST_DUPLICATED";
    }
    if (m.includes("RECIPIENT_NOT_FRIEND")) return "RECIPIENT_NOT_FRIEND";
    if (m.includes("RECIPIENT_SELF_INVALID")) return "RECIPIENT_SELF_INVALID";
    if (m.includes("RECIPIENTS_LIMIT_EXCEEDED")) {
      return "RECIPIENTS_LIMIT_EXCEEDED";
    }
    if (m.includes("REPOST_OWN_POST_FORBIDDEN")) {
      return "REPOST_OWN_POST_FORBIDDEN";
    }
    if (m.includes("SHARE_RATE_LIMIT_EXCEEDED")) {
      return "SHARE_RATE_LIMIT_EXCEEDED";
    }
    if (m.includes("POST_NOT_FOUND")) return "POST_NOT_FOUND";
    if (m.includes("UNAUTHORIZED")) return "UNAUTHORIZED";
    return undefined;
  }

  // ─── normalize reposts list ─────────────────────────────────────────────────

  private normalizePaginatedReposts(
    raw: unknown,
    fallbackPage: number,
    fallbackLimit: number,
    fallbackAuthorId: string
  ): PaginatedRepostsDto {
    const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
      string,
      unknown
    >;

    const rawList = Array.isArray(obj.reposts)
      ? obj.reposts
      : Array.isArray(obj.data)
        ? obj.data
        : Array.isArray(obj.items)
          ? obj.items
          : Array.isArray(raw)
            ? (raw as unknown[])
            : [];

    const reposts = rawList
      .map((it) => this.normalizeRepostItem(it, fallbackAuthorId))
      .filter((it): it is RepostItemDto => !!it);

    const rawPagination =
      obj.pagination && typeof obj.pagination === "object"
        ? (obj.pagination as Record<string, unknown>)
        : {};

    return {
      reposts,
      pagination: {
        page: Number(rawPagination.page ?? fallbackPage) || fallbackPage,
        limit: Number(rawPagination.limit ?? fallbackLimit) || fallbackLimit,
        total: Number(rawPagination.total ?? reposts.length) || reposts.length,
        hasMore: Boolean(rawPagination.hasMore),
      },
    };
  }

  /**
   * 2 shape phổ biến BE có thể trả:
   *  A) { repostId, authorId, comment, createdAt, post: {...} }
   *  B) { _id, userId, comment, createdAt, post: {...}, postId }
   *  C) flat post + repostMeta — fallback dùng item làm post chính.
   */
  private normalizeRepostItem(
    raw: unknown,
    fallbackAuthorId: string
  ): RepostItemDto | null {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;

    const rawPost =
      r.post && typeof r.post === "object"
        ? (r.post as Record<string, unknown>)
        : r.originalPost && typeof r.originalPost === "object"
          ? (r.originalPost as Record<string, unknown>)
          : r;

    const post = this.normalizePost(rawPost);

    const repostId =
      (r.repostId as string | undefined) ??
      (r.id as string | undefined) ??
      (r._id as { toString(): string } | undefined)?.toString() ??
      "";

    const authorId =
      (r.authorId as string | undefined) ??
      (r.userId as string | undefined) ??
      fallbackAuthorId;

    if (!repostId || !post.id) return null;

    return {
      repostId,
      authorId,
      comment:
        typeof r.comment === "string"
          ? r.comment
          : typeof r.message === "string"
            ? (r.message as string)
            : undefined,
      createdAt:
        typeof r.createdAt === "string"
          ? r.createdAt
          : typeof r.repostedAt === "string"
            ? (r.repostedAt as string)
            : new Date().toISOString(),
      post,
    };
  }

  /**
   * Mirror post.service `normalizePost` — chỉ giữ field cần cho UI.
   * Không reuse private method bên service kia để tránh coupling chặt.
   */
  private normalizePost(raw: Record<string, unknown>): PostResponseDto {
    const postId =
      (raw.id as string | undefined) ??
      (raw._id as { toString(): string } | undefined)?.toString() ??
      "";

    const rawUser =
      raw.user && typeof raw.user === "object"
        ? (raw.user as Record<string, unknown>)
        : null;

    const userId =
      (raw.userId as string | undefined) ??
      (rawUser?.id as string | undefined) ??
      (rawUser?._id as { toString(): string } | undefined)?.toString() ??
      "";

    const user = rawUser
      ? {
          ...rawUser,
          id:
            (rawUser.id as string | undefined) ??
            (rawUser._id as { toString(): string } | undefined)?.toString() ??
            "",
        }
      : undefined;

    return {
      ...raw,
      id: postId,
      userId,
      user,
      media: Array.isArray(raw.media)
        ? raw.media
        : Array.isArray(raw.mediaFiles)
          ? raw.mediaFiles
          : [],
      mentions: Array.isArray(raw.mentions) ? raw.mentions : [],
      hashtags: Array.isArray(raw.hashtags) ? raw.hashtags : [],
      likesCount: Number(raw.likesCount ?? 0) || 0,
      commentsCount: Number(raw.commentsCount ?? 0) || 0,
      sharesCount: Number(raw.sharesCount ?? 0) || 0,
      savesCount: Number(raw.savesCount ?? 0) || 0,
      isSaved: Boolean(raw.isSaved),
      viewsCount: Number(raw.viewsCount ?? 0) || 0,
      createdAt:
        typeof raw.createdAt === "string"
          ? raw.createdAt
          : new Date().toISOString(),
      updatedAt:
        typeof raw.updatedAt === "string"
          ? raw.updatedAt
          : typeof raw.createdAt === "string"
            ? raw.createdAt
            : new Date().toISOString(),
    } as PostResponseDto;
  }
}

export const shareService = new ShareService();
