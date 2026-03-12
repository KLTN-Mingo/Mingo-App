import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

import { Avatar, Icon, Text } from '@/components/ui';
import {
  EntityType,
  getNotificationMessage,
  NotificationResponseDto,
  NotificationType,
} from '@/dtos';

interface NotificationCardProps {
  notification: NotificationResponseDto;
  onPress?: (notification: NotificationResponseDto) => void;
  onDelete?: (notificationId: string) => void;
}

function getNotificationIcon(type: NotificationType): {
  name: string;
  color: string;
  bgColor: string;
} {
  const icons: Record<string, { name: string; color: string; bgColor: string }> = {
    // Post
    [NotificationType.POST_LIKE]: {
      name: 'heart.fill',
      color: '#EF4444',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    [NotificationType.POST_COMMENT]: {
      name: 'bubble.left.fill',
      color: '#3B82F6',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    [NotificationType.POST_SHARE]: {
      name: 'arrowshape.turn.up.right.fill',
      color: '#10B981',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    [NotificationType.POST_MENTION]: {
      name: 'at',
      color: '#8B5CF6',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    // Media
    [NotificationType.MEDIA_LIKE]: {
      name: 'heart.fill',
      color: '#EF4444',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    [NotificationType.MEDIA_COMMENT]: {
      name: 'bubble.left.fill',
      color: '#3B82F6',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    // Comment
    [NotificationType.COMMENT_LIKE]: {
      name: 'heart.fill',
      color: '#EF4444',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    [NotificationType.COMMENT_REPLY]: {
      name: 'arrowshape.turn.up.left.fill',
      color: '#3B82F6',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    [NotificationType.COMMENT_MENTION]: {
      name: 'at',
      color: '#8B5CF6',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    // Follow
    [NotificationType.FOLLOW_REQUEST]: {
      name: 'person.badge.plus',
      color: '#F59E0B',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    [NotificationType.FOLLOW_ACCEPTED]: {
      name: 'person.fill.checkmark',
      color: '#10B981',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    [NotificationType.FOLLOW_NEW]: {
      name: 'person.fill.badge.plus',
      color: '#768D85',
      bgColor: 'bg-primary-100 dark:bg-primary-900/30',
    },
    // Close Friend
    [NotificationType.CLOSE_FRIEND_REQUEST]: {
      name: 'star.fill',
      color: '#F59E0B',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    [NotificationType.CLOSE_FRIEND_ACCEPTED]: {
      name: 'star.fill',
      color: '#10B981',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    // Message
    [NotificationType.MESSAGE_NEW]: {
      name: 'envelope.fill',
      color: '#3B82F6',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    // System
    [NotificationType.SYSTEM]: {
      name: 'bell.fill',
      color: '#6B7280',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
  };

  return (
    icons[type] || {
      name: 'bell.fill',
      color: '#768D85',
      bgColor: 'bg-primary-100 dark:bg-primary-900/30',
    }
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} tuần trước`;
  return `${Math.floor(seconds / 2592000)} tháng trước`;
}

export function NotificationCard({
  notification,
  onPress,
  onDelete,
}: NotificationCardProps) {
  const { actor, notificationType, content, thumbnailUrl, isRead, createdAt } =
    notification;

  const icon = getNotificationIcon(notificationType);
  const message = getNotificationMessage(notificationType, actor?.name);
  const timeAgo = getTimeAgo(createdAt);

  return (
    <TouchableOpacity
      onPress={() => onPress?.(notification)}
      activeOpacity={0.7}
      className={`flex-row items-start p-4 ${
        !isRead
          ? 'bg-primary-50 dark:bg-primary-900/20'
          : 'bg-surface-light dark:bg-surface-dark'
      }`}
    >
      {/* Avatar with Icon Badge */}
      <View className="relative">
        <Avatar
          source={actor?.avatar ? { uri: actor.avatar } : undefined}
          fallback={actor?.name}
          size="md"
        />
        <View
          className={`absolute -bottom-1 -right-1 rounded-full p-1 ${icon.bgColor}`}
        >
          <Icon name={icon.name} size={12} color={icon.color} />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <Text className={`${!isRead ? 'font-semibold' : ''}`} numberOfLines={2}>
          {message}
        </Text>

        {/* Additional content (comment text, etc.) */}
        {content && (
          <Text variant="muted" numberOfLines={1} className="mt-0.5">
            "{content}"
          </Text>
        )}

        {/* Time */}
        <Text
          variant="muted"
          className={`text-xs mt-1 ${!isRead ? 'text-primary-500' : ''}`}
        >
          {timeAgo}
        </Text>
      </View>

      {/* Thumbnail */}
      {thumbnailUrl && (
        <Image
          source={{ uri: thumbnailUrl }}
          className="w-12 h-12 rounded-lg ml-2"
          resizeMode="cover"
        />
      )}

      {/* Unread indicator */}
      {!isRead && (
        <View className="w-2.5 h-2.5 rounded-full bg-primary-500 ml-2 mt-1" />
      )}
    </TouchableOpacity>
  );
}
