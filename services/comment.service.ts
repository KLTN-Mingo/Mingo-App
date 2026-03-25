import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ApiResponse,
  CommentResponseDto,
  CreateCommentRequestDto,
  PaginatedCommentsDto,
} from "@/dtos";
import { authService } from "@/services/auth.service";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

class CommentService {
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

    const response = await fetch(`${API_URL}${endpoint}`, {
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

  // Get comments for a post
  async getComments(
    postId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedCommentsDto> {
    return this.request<PaginatedCommentsDto>(
      `/posts/${postId}/comments?page=${page}&limit=${limit}`
    );
  }

  // Create a comment
  async createComment(
    postId: string,
    payload: CreateCommentRequestDto
  ): Promise<CommentResponseDto> {
    return this.request<CommentResponseDto>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Delete a comment
  async deleteComment(postId: string, commentId: string): Promise<void> {
    return this.request<void>(`/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    });
  }

  // Like a comment
  async likeComment(postId: string, commentId: string): Promise<void> {
    return this.request<void>(`/posts/${postId}/comments/${commentId}/like`, {
      method: "POST",
    });
  }

  // Unlike a comment
  async unlikeComment(postId: string, commentId: string): Promise<void> {
    return this.request<void>(`/posts/${postId}/comments/${commentId}/like`, {
      method: "DELETE",
    });
  }
}

export const commentService = new CommentService();
