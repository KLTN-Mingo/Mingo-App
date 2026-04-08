import { PaginationDto, PaginationParams } from "./common.dto";
import { UserMinimalDto } from "./user.dto";

// ─── Enums ─────────────────────────────────────────────────────────────────────

export enum PostVisibility {
  PUBLIC = "public",
  FRIENDS = "friends",
  /** Mingo / một số BE */
  CLOSE_FRIENDS = "close_friends",
  /** Mingo API guide: bestfriends */
  BESTFRIENDS = "bestfriends",
  PRIVATE = "private",
}

export enum ModerationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  FLAGGED = "flagged",
}

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export interface CreatePostRequestDto {
  contentText?: string;
  contentRichText?: string;
  visibility?: PostVisibility;
  mediaFiles?: MediaFileDto[];
  hashtags?: string[];
  mentions?: string[];
  locationName?: string;
  locationLatitude?: number;
  locationLongitude?: number;
}

export interface UpdatePostRequestDto {
  contentText?: string;
  contentRichText?: string;
  visibility?: PostVisibility;
}

export interface MediaFileDto {
  mediaType: "image" | "video";
  mediaUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  fileSize?: number;
  orderIndex?: number;
}

export interface GetPostsQueryDto extends PaginationParams {
  userId?: string;
  visibility?: PostVisibility;
}

export type FeedTab = "explore" | "friends";

export interface GetFeedQueryDto extends PaginationParams {
  tab?: FeedTab;
}

export interface SearchPostsQueryDto extends PaginationParams {
  query?: string;
  hashtag?: string;
}

export interface SharePostRequestDto {
  postId: string;
  sharedTo: "feed" | "message" | "external";
  caption?: string;
}

export interface SavePostRequestDto {
  postId: string;
  collectionName?: string;
}

export interface GetSavedPostsQueryDto extends PaginationParams {
  collectionName?: string;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export interface PostMediaDto {
  id: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  fileSize?: number;
  orderIndex: number;
}

export interface PostLocationDto {
  name?: string;
  latitude?: number;
  longitude?: number;
}

export interface AIScoreDto {
  toxic?: number;
  hateSpeech?: number;
  spam?: number;
  overallRisk?: number;
}

export interface PostResponseDto {
  id: string;
  userId: string;
  user?: UserMinimalDto;
  contentText?: string;
  contentRichText?: string;
  visibility: PostVisibility;
  media?: PostMediaDto[];
  hashtags?: string[];
  mentions?: UserMinimalDto[];
  location?: PostLocationDto;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  viewsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  moderationStatus: ModerationStatus;
  isHidden: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostDetailDto extends PostResponseDto {
  aiScores?: AIScoreDto;
  hiddenReason?: string;
  topComments?: CommentSummaryDto[];
}

export interface PaginatedPostsDto {
  posts: PostResponseDto[];
  pagination: PaginationDto;
}

export interface PostLikersDto {
  users: UserMinimalDto[];
  pagination: Pick<PaginationDto, "page" | "limit" | "total">;
}

export interface ShareResponseDto {
  id: string;
  userId: string;
  postId: string;
  sharedTo: "feed" | "message" | "external";
  caption?: string;
  createdAt: string;
}

export interface SavedPostsResponseDto {
  posts: PostResponseDto[];
  collections: string[];
  pagination: Pick<PaginationDto, "page" | "limit" | "total">;
}

// ─── Comment Summary (tránh circular import) ───────────────────────────────────

export interface CommentSummaryDto {
  id: string;
  userId: string;
  user?: UserMinimalDto;
  contentText: string;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  createdAt: string;
}
