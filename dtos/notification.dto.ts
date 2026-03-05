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
  const name = actorName || 'Ai đó';

  const messages: Record<NotificationType, string> = {
    // Post
    [NotificationType.POST_LIKE]: `${name} đã thích bài viết của bạn`,
    [NotificationType.POST_COMMENT]: `${name} đã bình luận bài viết của bạn`,
    [NotificationType.POST_SHARE]: `${name} đã chia sẻ bài viết của bạn`,
    [NotificationType.POST_MENTION]: `${name} đã nhắc đến bạn trong một bài viết`,
    // Media
    [NotificationType.MEDIA_LIKE]: `${name} đã thích ảnh/video của bạn`,
    [NotificationType.MEDIA_COMMENT]: `${name} đã bình luận ảnh/video của bạn`,
    [NotificationType.MEDIA_SHARE]: `${name} đã chia sẻ ảnh/video của bạn`,
    // Comment
    [NotificationType.COMMENT_LIKE]: `${name} đã thích bình luận của bạn`,
    [NotificationType.COMMENT_REPLY]: `${name} đã trả lời bình luận của bạn`,
    [NotificationType.COMMENT_MENTION]: `${name} đã nhắc đến bạn trong một bình luận`,
    // Follow
    [NotificationType.FOLLOW_REQUEST]: `${name} đã gửi yêu cầu theo dõi bạn`,
    [NotificationType.FOLLOW_ACCEPTED]: `${name} đã chấp nhận yêu cầu theo dõi của bạn`,
    [NotificationType.FOLLOW_NEW]: `${name} đã bắt đầu theo dõi bạn`,
    // Close Friend
    [NotificationType.CLOSE_FRIEND_REQUEST]: `${name} muốn trở thành bạn thân của bạn`,
    [NotificationType.CLOSE_FRIEND_ACCEPTED]: `${name} đã chấp nhận yêu cầu bạn thân của bạn`,
    // Message
    [NotificationType.MESSAGE_NEW]: `${name} đã gửi tin nhắn cho bạn`,
    // System
    [NotificationType.SYSTEM]: 'Thông báo từ hệ thống',
  };

  return messages[type] || 'Bạn có thông báo mới';
}