import type {
  GlobalSearchParams,
  GlobalSearchResultDto,
  GlobalSearchType,
  SearchPostItemDto,
  SearchUserItemDto,
} from "@/dtos/search.dto";
import { apiRequest } from "@/services/api-client";

/** BE constraint: limit phải từ 1..20 */
const MAX_LIMIT = 20;
const MIN_QUERY_LEN = 2;

class SearchService {
  /**
   * GET /search — global search (users + posts).
   * BE yêu cầu `q` >= 2 ký tự; ngắn hơn sẽ trả về kết quả rỗng (no-op) để tránh lãng phí roundtrip.
   */
  async globalSearch(
    params: GlobalSearchParams
  ): Promise<GlobalSearchResultDto> {
    const query = (params.q ?? "").trim();
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, params.limit ?? 10));
    const type: GlobalSearchType = params.type ?? "all";

    if (query.length < MIN_QUERY_LEN) {
      return this.emptyResult(query, page, limit);
    }

    const search = new URLSearchParams({
      q: query,
      page: String(page),
      limit: String(limit),
      type,
    });

    const raw = await apiRequest<unknown>(`/search?${search.toString()}`);
    return this.normalize(raw, query, page, limit);
  }

  /** Convenience: chỉ tìm users (image 1 dùng cho danh sách user). */
  async searchUsers(
    q: string,
    page = 1,
    limit = 10
  ): Promise<{ users: SearchUserItemDto[]; total: number; page: number; limit: number }> {
    const r = await this.globalSearch({ q, page, limit, type: "users" });
    return {
      users: r.users,
      total: r.pagination.usersTotal,
      page: r.pagination.page,
      limit: r.pagination.limit,
    };
  }

  /** Convenience: chỉ tìm posts. */
  async searchPosts(
    q: string,
    page = 1,
    limit = 10
  ): Promise<{ posts: SearchPostItemDto[]; total: number; page: number; limit: number }> {
    const r = await this.globalSearch({ q, page, limit, type: "posts" });
    return {
      posts: r.posts,
      total: r.pagination.postsTotal,
      page: r.pagination.page,
      limit: r.pagination.limit,
    };
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  private emptyResult(
    query: string,
    page: number,
    limit: number
  ): GlobalSearchResultDto {
    return {
      query,
      users: [],
      posts: [],
      pagination: { page, limit, usersTotal: 0, postsTotal: 0 },
    };
  }

  /**
   * BE đôi khi trả `_id` thay vì `id` (Mongo). Chuẩn hoá an toàn từ `unknown`.
   */
  private normalize(
    raw: unknown,
    fallbackQuery: string,
    fallbackPage: number,
    fallbackLimit: number
  ): GlobalSearchResultDto {
    if (!raw || typeof raw !== "object") {
      return this.emptyResult(fallbackQuery, fallbackPage, fallbackLimit);
    }
    const r = raw as Record<string, unknown>;

    const rawUsers = Array.isArray(r.users) ? r.users : [];
    const rawPosts = Array.isArray(r.posts) ? r.posts : [];
    const rawPagination =
      r.pagination && typeof r.pagination === "object"
        ? (r.pagination as Record<string, unknown>)
        : {};

    return {
      query: typeof r.query === "string" ? r.query : fallbackQuery,
      users: rawUsers.map((u) => this.normalizeUser(u)),
      posts: rawPosts.map((p) => this.normalizePost(p)),
      pagination: {
        page: Number(rawPagination.page ?? fallbackPage) || fallbackPage,
        limit: Number(rawPagination.limit ?? fallbackLimit) || fallbackLimit,
        usersTotal: Number(rawPagination.usersTotal ?? 0) || 0,
        postsTotal: Number(rawPagination.postsTotal ?? 0) || 0,
      },
    };
  }

  private normalizeUser(raw: unknown): SearchUserItemDto {
    const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const id =
      (r.id as string | undefined) ??
      (r._id as { toString(): string } | undefined)?.toString() ??
      "";
    return {
      id,
      name: typeof r.name === "string" ? r.name : undefined,
      avatar: typeof r.avatar === "string" ? r.avatar : undefined,
      bio: typeof r.bio === "string" ? r.bio : undefined,
      verified: Boolean(r.verified),
      followersCount: Number(r.followersCount ?? 0) || 0,
      postsCount: Number(r.postsCount ?? 0) || 0,
    };
  }

  private normalizePost(raw: unknown): SearchPostItemDto {
    const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const id =
      (r.id as string | undefined) ??
      (r._id as { toString(): string } | undefined)?.toString() ??
      "";
    const rawUser = r.user;
    return {
      id,
      contentText: typeof r.contentText === "string" ? r.contentText : undefined,
      likesCount: Number(r.likesCount ?? 0) || 0,
      commentsCount: Number(r.commentsCount ?? 0) || 0,
      sharesCount: Number(r.sharesCount ?? 0) || 0,
      createdAt:
        typeof r.createdAt === "string"
          ? r.createdAt
          : r.createdAt instanceof Date
            ? r.createdAt.toISOString()
            : new Date().toISOString(),
      user: rawUser ? this.normalizePostUser(rawUser) : null,
    };
  }

  private normalizePostUser(raw: unknown): SearchPostItemDto["user"] {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    const id =
      (r.id as string | undefined) ??
      (r._id as { toString(): string } | undefined)?.toString() ??
      "";
    if (!id) return null;
    return {
      id,
      name: typeof r.name === "string" ? r.name : undefined,
      avatar: typeof r.avatar === "string" ? r.avatar : undefined,
      verified: Boolean(r.verified),
    };
  }
}

export const searchService = new SearchService();
