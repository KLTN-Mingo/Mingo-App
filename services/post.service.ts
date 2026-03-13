import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ApiResponse,
  CreatePostRequestDto,
  PaginatedPostsDto,
  PostDetailDto,
  PostResponseDto,
} from "@/dtos";
import { authService } from "@/services/auth.service";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

class PostService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_URL}/posts${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    const json: ApiResponse<T> = await response.json();

    if (!response.ok) {
      await authService.handleUnauthorizedResponse(response, json.message);
      throw new Error(json.message || "Something went wrong");
    }

    return json.data;
  }

  // Get all posts
  async getAllPosts(): Promise<PostResponseDto[]> {
    return this.request<PostResponseDto[]>("");
  }

  // Get feed posts (from following)
  async getFeedPosts(page = 1, limit = 10): Promise<PaginatedPostsDto> {
    return this.request<PaginatedPostsDto>(`/feed?page=${page}&limit=${limit}`);
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
}

export const postService = new PostService();
