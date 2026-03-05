import { PaginationDto } from './common.dto';
import { UserMinimalDto } from './user.dto';

// ─── Enums ─────────────────────────────────────────────────────────────────────

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export interface CreateMediaRequestDto {
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  width?: number;
  height?: number;
  duration?: number;
  fileSize?: number;
  orderIndex?: number;
}

export interface UpdateMediaRequestDto {
  caption?: string;
  orderIndex?: number;
}

export interface CreateMediaCommentRequestDto {
  contentText: string;
}

export interface CreateMediaReplyRequestDto {
  contentText: string;
  parentCommentId: string;
  originalCommentId: string;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export interface MediaResponseDto {
  id: string;
  postId: string;
  userId: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  width?: number;
  height?: number;
  duration?: number;
  fileSize?: number;
  orderIndex: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaDetailDto extends MediaResponseDto {
  user?: UserMinimalDto;
  isLiked: boolean;
}

export interface PaginatedMediaDto {
  media: MediaDetailDto[];
  pagination: PaginationDto;
}