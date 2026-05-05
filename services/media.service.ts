import {
  CommentResponseDto,
  CreateMediaCommentRequestDto,
  CreateMediaReplyRequestDto,
  CreateMediaRequestDto,
  MediaDetailDto,
  MediaResponseDto,
  UpdateMediaRequestDto,
} from "@/dtos";
import { apiRequest } from "@/services/api-client";

class MediaService {
  createMedia(postId: string, payload: CreateMediaRequestDto) {
    return apiRequest<MediaResponseDto>(`/posts/${postId}/media`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  getMediaById(mediaId: string) {
    return apiRequest<MediaDetailDto>(`/media/${mediaId}`);
  }

  getPostMedia(postId: string) {
    return apiRequest<MediaDetailDto[]>(`/posts/${postId}/media`);
  }

  updateMedia(mediaId: string, payload: UpdateMediaRequestDto) {
    return apiRequest<MediaResponseDto>(`/media/${mediaId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  deleteMedia(mediaId: string) {
    return apiRequest<void>(`/media/${mediaId}`, { method: "DELETE" });
  }

  likeMedia(mediaId: string) {
    return apiRequest<void>(`/media/${mediaId}/like`, { method: "POST" });
  }

  unlikeMedia(mediaId: string) {
    return apiRequest<void>(`/media/${mediaId}/like`, { method: "DELETE" });
  }

  createComment(mediaId: string, payload: CreateMediaCommentRequestDto) {
    return apiRequest<CommentResponseDto>(`/media/${mediaId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  createReply(mediaId: string, commentId: string, payload: CreateMediaReplyRequestDto) {
    return apiRequest<CommentResponseDto>(
      `/media/${mediaId}/comments/${commentId}/replies`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  shareMedia(mediaId: string, caption?: string) {
    return apiRequest<void>(`/media/${mediaId}/share`, {
      method: "POST",
      body: JSON.stringify({ caption }),
    });
  }
}

export const mediaService = new MediaService();
