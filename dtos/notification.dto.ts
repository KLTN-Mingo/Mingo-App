import { PaginationDto, PaginationParams } from './common.dto';
import { UserMinimalDto } from './user.dto';

// ─── Enums ─────────────────────────────────────────────────────────────────────

export enum NotificationType {
  // Post
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
  POST_SHARE = 'post_share',
  POST_MENTION = 'post_mention',
  // Media
  MEDIA_LIKE = 'media_like',
  MEDIA_COMMENT = 'media_comment',
  MEDIA_SHARE = 'media_share',
  // Comment
  COMMENT_LIKE = 'comment_like',
  COMMENT_REPLY = 'comment_reply',
  COMMENT_MENTION = 'comment_mention',
  // Follow
  FOLLOW_REQUEST = 'follow_request',
  FOLLOW_ACCEPTED = 'follow_accepted',
  FOLLOW_NEW = 'follow_new',
  // Close Friend
  CLOSE_FRIEND_REQUEST = 'close_friend_request',
  CLOSE_FRIEND_ACCEPTED = 'close_friend_accepted',
  // Message
  MESSAGE_NEW = 'message_new',
  // System
  SYSTEM = 'system',
}

export enum EntityType {
  POST = 'post',
  MEDIA = 'media',
  COMMENT = 'comment',
  USER = 'user',
  MESSAGE = 'message',
}

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export interface GetNotificationsQueryDto extends PaginationParams {
  type?: NotificationType;
  isRead?: boolean;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export interface NotificationResponseDto {
  id: string;
  userId: string;
  actor?: UserMinimalDto;
  notificationType: NotificationType;
  entityType?: EntityType;
  entityId?: string;
  postId?: string;
  mediaId?: string;
  commentId?: string;
  content?: string;
  thumbnailUrl?: string;
  isRead: boolean;
  isSeen: boolean;
  createdAt: string;
}

export interface PaginatedNotificationsDto {
  notifications: NotificationResponseDto[];
  pagination: PaginationDto;
}

export interface NotificationCountDto {
  total: number;
  unread: number;
  unseen: number;
}

export interface NotificationGroupDto {
  type: NotificationType;
  count: number;
  latestNotification: NotificationResponseDto;
}

// ─── Notification Message Helper ───────────────────────────────────────────────

export function getNotificationMessage(
  type: NotificationType,
  actorName?: string
): string {
  const name = actorName || 'Someone';

  const messages: Record<NotificationType, string> = {
    // Post
    [NotificationType.POST_LIKE]: `${name} liked your post`,
    [NotificationType.POST_COMMENT]: `${name} commented on your post`,
    [NotificationType.POST_SHARE]: `${name} shared your post`,
    [NotificationType.POST_MENTION]: `${name} mentioned you in a post`,
    // Media
    [NotificationType.MEDIA_LIKE]: `${name} liked your photo/video`,
    [NotificationType.MEDIA_COMMENT]: `${name} commented on your photo/video`,
    [NotificationType.MEDIA_SHARE]: `${name} shared your photo/video`,
    // Comment
    [NotificationType.COMMENT_LIKE]: `${name} liked your comment`,
    [NotificationType.COMMENT_REPLY]: `${name} replied to your comment`,
    [NotificationType.COMMENT_MENTION]: `${name} mentioned you in a comment`,
    // Follow
    [NotificationType.FOLLOW_REQUEST]: `${name} sent you a follow request`,
    [NotificationType.FOLLOW_ACCEPTED]: `${name} accepted your follow request`,
    [NotificationType.FOLLOW_NEW]: `${name} started following you`,
    // Close Friend
    [NotificationType.CLOSE_FRIEND_REQUEST]: `${name} wants to be your close friend`,
    [NotificationType.CLOSE_FRIEND_ACCEPTED]: `${name} accepted your close friend request`,
    // Message
    [NotificationType.MESSAGE_NEW]: `${name} sent you a message`,
    // System
    [NotificationType.SYSTEM]: 'System notification',
  };

  return messages[type] || 'You have a new notification';
}