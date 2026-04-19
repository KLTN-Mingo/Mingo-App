import {
  CreatePostRequestDto,
  FeedTab,
  PaginatedPostsDto,
  PostDetailDto,
  PostResponseDto,
  ShareResponseDto,
  UpdatePostRequestDto,
} from "@/dtos";
import { PaginationDto } from "@/dtos/common.dto";

/** Góp ý feed — Mingo doc + một số BE cũ */
export type FeedFeedbackType =
  | "hide"
  | "not_interested"
  | "see_more"
  | "like"
  | "skip"
  | "interested"
  | "seen";
import { apiMultipartRequest, apiRequest } from "@/services/api-client";

/** Ký tự không hiển thị: backend yêu cầu contentText khi chưa có media trong JSON (upload media sau). */
const MEDIA_ONLY_PLACEHOLDER = "\u2060";

/** BE `GET /users/:id/posts` giới hạn `limit` (thường ≤ 20). */
const USER_POSTS_PAGE_LIMIT = 20;
class PostService {
  private normalizePost(raw: any): PostResponseDto {
    const postId = raw?.id ?? raw?._id?.toString?.() ?? String(raw?._id ?? "");

    const rawUser = raw?.user;
    const userId =
      raw?.userId ??
      rawUser?.id ??
      rawUser?._id?.toString?.() ??
      String(rawUser?._id ?? "");

    const user = rawUser
      ? {
          ...rawUser,
          id:
            rawUser.id ??
            rawUser._id?.toString?.() ??
            String(rawUser._id ?? ""),
        }
      : undefined;

    return {
      ...raw,
      id: postId,
      userId,
      user,
      media: Array.isArray(raw?.media)
        ? raw.media
        : Array.isArray(raw?.mediaFiles)
          ? raw.mediaFiles
          : [],
      mentions: Array.isArray(raw?.mentions) ? raw.mentions : [],
      hashtags: Array.isArray(raw?.hashtags) ? raw.hashtags : [],
      likesCount: Number(raw?.likesCount ?? 0),
      commentsCount: Number(raw?.commentsCount ?? 0),
      sharesCount: Number(raw?.sharesCount ?? 0),
      savesCount: Number(raw?.savesCount ?? 0),
      isSaved: Boolean(raw?.isSaved),
      viewsCount: Number(raw?.viewsCount ?? 0),
      createdAt: raw?.createdAt ?? new Date().toISOString(),
      updatedAt: raw?.updatedAt ?? raw?.createdAt ?? new Date().toISOString(),
    } as PostResponseDto;
  }

  /**
   * Chỉ giữ bài do `userId` đăng — dùng khi BE `GET /posts?userId=` chưa lọc và trả cả danh sách.
   */
  filterPostsForUser(
    posts: PostResponseDto[],
    userId: string
  ): PostResponseDto[] {
    const target = String(userId ?? "").trim();
    if (!target) return posts;
    return posts.filter((p) => {
      const fromPost = String(p.userId ?? "").trim();
      if (fromPost && fromPost === target) return true;
      const fromNested = String(p.user?.id ?? "").trim();
      return fromNested === target;
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return apiRequest<T>(`/posts${endpoint}`, options);
  }

  // Get feed posts by tab (explore/friends)
  async getFeedPosts(
    page = 1,
    limit = 20,
    tab: FeedTab = "explore"
  ): Promise<PaginatedPostsDto> {
    const raw = await this.request<any>(
      `/feed?tab=${tab}&page=${page}&limit=${limit}`
    );

    const rawPosts = Array.isArray(raw?.posts)
      ? raw.posts
      : Array.isArray(raw?.items)
        ? raw.items
        : Array.isArray(raw)
          ? raw
          : [];

    const posts = rawPosts.map((item: any) => this.normalizePost(item));

    const rawPagination = raw?.pagination ?? {};
    const pagination = {
      page: Number(rawPagination.page ?? page),
      limit: Number(rawPagination.limit ?? limit),
      total: Number(rawPagination.total ?? posts.length),
      totalPages: Number(rawPagination.totalPages ?? 1),
      hasMore: Boolean(rawPagination.hasMore ?? false),
    };

    const data: PaginatedPostsDto = {
      posts,
      pagination,
    };

    console.log("[postService.getFeedPosts]", {
      tab,
      page,
      limit,
      raw,
      normalizedPostsCount: posts.length,
      data,
    });

    return data;
  }

  // Get trending posts
  async getTrendingPosts(): Promise<PostResponseDto[]> {
    return this.request<PostResponseDto[]>("/trending");
  }

  // Get post by ID
  async getPostById(postId: string): Promise<PostDetailDto> {
    return this.request<PostDetailDto>(`/${postId}`);
  }

  // Create post
  async createPost(payload: CreatePostRequestDto): Promise<PostDetailDto> {
    return this.request<PostDetailDto>("", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Upload ảnh/video sau khi đã tạo post (multipart).
   * Contract Mingo: POST /api/posts/:postId/media — field `files` (lặp lại mỗi file), optional `caption`, `orderIndex`.
   */
  async uploadPostMedia(
    postId: string,
    assets: {
      uri: string;
      fileName: string;
      mimeType: string;
    }[],
    options?: { caption?: string; orderIndex?: number }
  ): Promise<unknown> {
    if (assets.length === 0) return undefined;

    const fileField =
      process.env.EXPO_PUBLIC_POST_MEDIA_FIELD?.trim() || "files";

    const form = new FormData();
    for (const a of assets) {
      form.append(fileField, {
        uri: a.uri,
        name: a.fileName,
        type: a.mimeType,
      } as unknown as Blob);
    }
    if (options?.caption != null && options.caption !== "") {
      form.append("caption", options.caption);
    }
    form.append("orderIndex", String(options?.orderIndex ?? 0));

    return apiMultipartRequest<unknown>(
      `/posts/${encodeURIComponent(postId)}/media`,
      form
    );
  }

  /** Tạo bài rồi upload file local (RN) theo luồng hai bước của Mingo API. */
  async createPostWithLocalMedia(
    payload: CreatePostRequestDto,
    localAssets: {
      uri: string;
      fileName: string;
      mimeType: string;
    }[]
  ): Promise<PostDetailDto> {
    const hasMedia = localAssets.length > 0;
    const text = payload.contentText?.trim() ?? "";
    const body: CreatePostRequestDto = {
      ...payload,
      mediaFiles: undefined,
      contentText:
        text.length > 0
          ? payload.contentText
          : hasMedia
            ? MEDIA_ONLY_PLACEHOLDER
            : payload.contentText,
    };

    const created = await this.createPost(body);
    if (hasMedia) {
      await this.uploadPostMedia(created.id, localAssets);
    }
    return this.getPostById(created.id);
  }

  // Update post
  async updatePost(
    postId: string,
    payload: UpdatePostRequestDto
  ): Promise<PostDetailDto> {
    return this.request<PostDetailDto>(`/${postId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // Delete post
  async deletePost(postId: string): Promise<void> {
    return this.request<void>(`/${postId}`, { method: "DELETE" });
  }

  // Like post
  async likePost(postId: string): Promise<void> {
    return this.request<void>(`/${postId}/like`, { method: "POST" });
  }

  // Unlike post
  async unlikePost(postId: string): Promise<void> {
    return this.request<void>(`/${postId}/like`, { method: "DELETE" });
  }

  // Share post
  async sharePost(
    postId: string,
    options?: { caption?: string; sharedTo?: "feed" | "message" | "external" }
  ): Promise<ShareResponseDto | null> {
    return this.request<ShareResponseDto | null>(`/${postId}/share`, {
      method: "POST",
      body: JSON.stringify({
        sharedTo: options?.sharedTo ?? "feed",
        caption: options?.caption,
      }),
    });
  }

  async getAllPosts(
    page = 1,
    limit = 20,
    query?: { userId?: string; visibility?: string }
  ): Promise<PaginatedPostsDto> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (query?.userId) params.set("userId", query.userId);
    if (query?.visibility) params.set("visibility", query.visibility);
    const raw = await this.request<any>(`?${params.toString()}`);
    return this.normalizePaginatedPosts(raw, page, limit);
  }

  /**
   * GET /api/users/:userId/posts — bài theo user (phân trang; BE giới hạn limit, vd. ≤ 20).
   */
  async getUserPosts(
    userId: string,
    page = 1,
    limit = USER_POSTS_PAGE_LIMIT
  ): Promise<PaginatedPostsDto> {
    const safeLimit = Math.min(Math.max(limit, 1), USER_POSTS_PAGE_LIMIT);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(safeLimit),
    });
    const raw = await apiRequest<any>(
      `/users/${encodeURIComponent(userId)}/posts?${params}`
    );
    return this.normalizePaginatedPosts(raw, page, safeLimit);
  }

  /** Gom các trang từ `getUserPosts` — tránh GET /posts toàn cục rồi lọc theo user. */
  async fetchAllUserPosts(userId: string): Promise<PostResponseDto[]> {
    const out: PostResponseDto[] = [];
    let page = 1;
    for (;;) {
      const { posts, pagination } = await this.getUserPosts(
        userId,
        page,
        USER_POSTS_PAGE_LIMIT
      );
      out.push(...posts);
      if (!pagination.hasMore || posts.length === 0) break;
      page += 1;
    }
    return out;
  }

  private normalizePaginatedPosts(
    raw: any,
    page: number,
    limit: number
  ): PaginatedPostsDto {
    const rawPosts = Array.isArray(raw?.posts)
      ? raw.posts
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
          ? raw
          : [];
    const posts = rawPosts.map((item: any) => this.normalizePost(item));
    const rawPagination = raw?.pagination ?? {};
    const pageNum = Number(rawPagination.page ?? page);
    const limitNum = Number(rawPagination.limit ?? limit);
    const total = Number(rawPagination.total ?? posts.length);
    const totalPages = Number(
      rawPagination.totalPages ??
        Math.max(1, Math.ceil(total / Math.max(limitNum, 1)))
    );
    const hasMore =
      typeof rawPagination.hasMore === "boolean"
        ? rawPagination.hasMore
        : pageNum < totalPages;
    const pagination: PaginationDto = {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasMore,
    };
    return { posts, pagination };
  }

  async savePost(postId: string, collectionName?: string): Promise<void> {
    return this.request<void>(`/${postId}/save`, {
      method: "POST",
      body: JSON.stringify({ collectionName }),
    });
  }

  async unsavePost(postId: string): Promise<void> {
    return this.request<void>(`/${postId}/save`, { method: "DELETE" });
  }

  async getSavedPosts(page = 1, limit = 20): Promise<PaginatedPostsDto> {
    const raw = await this.request<any>(
      `/saved?page=${page}&limit=${limit}`
    );
    return this.normalizePaginatedPosts(raw, page, limit);
  }

  async getPostStats(postId: string): Promise<Record<string, number>> {
    return this.request<Record<string, number>>(
      `/${encodeURIComponent(postId)}/stats`
    );
  }

  async submitFeedFeedback(
    postId: string,
    feedbackType: FeedFeedbackType,
    tab?: FeedTab
  ): Promise<unknown> {
    return this.request<unknown>("/feed/feedback", {
      method: "POST",
      body: JSON.stringify({ postId, feedbackType, tab }),
    });
  }

  async getFeedMetrics(
    days = 7,
    tab?: FeedTab
  ): Promise<Record<string, unknown>> {
    const q = new URLSearchParams({ days: String(days) });
    if (tab) q.set("tab", tab);
    return this.request<Record<string, unknown>>(`/feed/metrics?${q}`);
  }
}

export const postService = new PostService();
