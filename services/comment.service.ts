import {
  CommentResponseDto,
  CreateCommentRequestDto,
  CreateReplyRequestDto,
  PaginatedCommentsDto,
  UpdateCommentRequestDto,
} from "@/dtos";
import { apiRequest } from "@/services/api-client";

class CommentService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return apiRequest<T>(endpoint, options);
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

  async getCommentById(commentId: string): Promise<CommentResponseDto> {
    return this.request<CommentResponseDto>(`/comments/${commentId}`);
  }

  async updateComment(
    commentId: string,
    payload: UpdateCommentRequestDto
  ): Promise<CommentResponseDto> {
    return this.request<CommentResponseDto>(`/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // Delete a comment
  async deleteComment(postId: string, commentId: string): Promise<void> {
    return this.request<void>(`/comments/${commentId}`, {
      method: "DELETE",
    });
  }

  // Like a comment
  async likeComment(postId: string, commentId: string): Promise<void> {
    return this.request<void>(`/comments/${commentId}/like`, {
      method: "POST",
    });
  }

  // Unlike a comment
  async unlikeComment(postId: string, commentId: string): Promise<void> {
    return this.request<void>(`/comments/${commentId}/like`, {
      method: "DELETE",
    });
  }

  async getCommentReplies(
    commentId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedCommentsDto> {
    return this.request<PaginatedCommentsDto>(
      `/comments/${commentId}/replies?page=${page}&limit=${limit}`
    );
  }

  async createReply(
    postId: string,
    commentId: string,
    payload: CreateReplyRequestDto
  ): Promise<CommentResponseDto> {
    return this.request<CommentResponseDto>(
      `/posts/${postId}/comments/${commentId}/replies`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }
}

export const commentService = new CommentService();
