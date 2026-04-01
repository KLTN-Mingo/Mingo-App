import {
  CreatePostRequestDto,
  FeedTab,
  PaginatedPostsDto,
  PostDetailDto,
  PostResponseDto,
  ShareResponseDto,
} from "@/dtos";
import { apiRequest } from "@/services/api-client";

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
      viewsCount: Number(raw?.viewsCount ?? 0),
      createdAt: raw?.createdAt ?? new Date().toISOString(),
      updatedAt: raw?.updatedAt ?? raw?.createdAt ?? new Date().toISOString(),
    } as PostResponseDto;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return apiRequest<T>(`/posts${endpoint}`, options);
  }

  // Get all posts
  async getAllPosts(): Promise<PostResponseDto[]> {
    return this.request<PostResponseDto[]>("");
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

  // Update post
  async updatePost(
    postId: string,
    payload: { contentText?: string; visibility?: string }
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
  async sharePost(postId: string, caption?: string): Promise<ShareResponseDto | null> {
    return this.request<ShareResponseDto | null>(`/${postId}/share`, {
      method: "POST",
      body: JSON.stringify({ caption }),
    });
  }
}

export const postService = new PostService();
