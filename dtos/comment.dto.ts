import { PaginationDto, PaginationParams } from './common.dto';
import { UserMinimalDto } from './user.dto';

// ─── Enums ─────────────────────────────────────────────────────────────────────

export enum CommentModerationStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export interface CreateCommentRequestDto {
  contentText: string;
  source?: string;
}

export interface CreateReplyRequestDto {
  contentText: string;
  parentCommentId: string;
  originalCommentId: string;
  source?: string;
}

export interface UpdateCommentRequestDto {
  contentText: string;
}

export interface GetCommentsQueryDto extends PaginationParams {}

export interface GetRepliesQueryDto extends PaginationParams {}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export interface CommentResponseDto {
  id: string;
  postId: string;
  userId: string;
  user?: UserMinimalDto;
  contentText: string;
  parentCommentId?: string | null;
  originalCommentId?: string | null;
  isReply: boolean;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  moderationStatus: CommentModerationStatus;
  isHidden: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentDetailDto extends CommentResponseDto {
  topReplies?: CommentResponseDto[];
}

export interface PaginatedCommentsDto {
  comments: CommentResponseDto[];
  pagination: PaginationDto;
}