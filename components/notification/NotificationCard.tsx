import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

import { Avatar, Icon, Text } from '@/components/ui';
import {
  getNotificationMessage,
  NotificationResponseDto,
  NotificationType,
} from '@/dtos';
import { colors, statusColors } from '@/styles/colors';

interface NotificationCardProps {
  notification: NotificationResponseDto;
  onPress?: (notification: NotificationResponseDto) => void;
  onDelete?: (notification: NotificationResponseDto) => void;
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
      color: statusColors.error.light,
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    [NotificationType.POST_COMMENT]: {
      name: 'bubble.left.fill',
      color: statusColors.info.light,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    [NotificationType.POST_SHARE]: {
      name: 'arrowshape.turn.up.right.fill',
      color: statusColors.success.light,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    [NotificationType.POST_MENTION]: {
      name: 'at',
      color: statusColors.info.light,
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    // Media
    [NotificationType.MEDIA_LIKE]: {
      name: 'heart.fill',
      color: statusColors.error.light,
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    [NotificationType.MEDIA_COMMENT]: {
      name: 'bubble.left.fill',
      color: statusColors.info.light,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    // Comment
    [NotificationType.COMMENT_LIKE]: {
      name: 'heart.fill',
      color: statusColors.error.light,
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    [NotificationType.COMMENT_REPLY]: {
      name: 'arrowshape.turn.up.left.fill',
      color: statusColors.info.light,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    [NotificationType.COMMENT_MENTION]: {
      name: 'at',
      color: statusColors.info.light,
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    // Follow
    [NotificationType.FOLLOW_REQUEST]: {
      name: 'person.badge.plus',
      color: statusColors.warning.light,
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    [NotificationType.FOLLOW_ACCEPTED]: {
      name: 'person.fill.checkmark',
      color: statusColors.success.light,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    [NotificationType.FOLLOW_NEW]: {
      name: 'person.fill.badge.plus',
      color: colors.primary[100],
      bgColor: 'bg-primary-100 dark:bg-primary-900/30',
    },
    // Close Friend
    [NotificationType.CLOSE_FRIEND_REQUEST]: {
      name: 'star.fill',
      color: statusColors.warning.light,
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    [NotificationType.CLOSE_FRIEND_ACCEPTED]: {
      name: 'star.fill',
      color: statusColors.success.light,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    // Message
    [NotificationType.MESSAGE_NEW]: {
      name: 'envelope.fill',
      color: statusColors.info.light,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    // System
    [NotificationType.SYSTEM]: {
      name: 'bell.fill',
      color: colors.dark[300],
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
  };

  return (
    icons[type] || {
      name: 'bell.fill',
      color: colors.primary[100],
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

  const rowClass = `flex-row items-start p-4 ${
    !isRead
      ? 'bg-primary-50 dark:bg-primary-900/20'
      : 'bg-surface-light dark:bg-surface-dark'
  }`;

  return (
    <View className="flex-row items-stretch border-b border-border-light dark:border-border-dark">
      <TouchableOpacity
        onPress={() => onPress?.(notification)}
        activeOpacity={0.7}
        className={`flex-1 flex-row items-start ${rowClass}`}
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

          {content && (
            <Text variant="muted" numberOfLines={1} className="mt-0.5">
              &quot;{content}&quot;
            </Text>
          )}

          <Text
            variant="muted"
            className={`text-xs mt-1 ${!isRead ? 'text-primary-500' : ''}`}
          >
            {timeAgo}
          </Text>
        </View>

        {thumbnailUrl && (
          <Image
            source={{ uri: thumbnailUrl }}
            className="w-12 h-12 rounded-lg ml-2"
            resizeMode="cover"
          />
        )}

        {!isRead && (
          <View className="w-2.5 h-2.5 rounded-full bg-primary-500 ml-2 mt-1 self-start" />
        )}
      </TouchableOpacity>

      {onDelete ? (
        <TouchableOpacity
          onPress={() => onDelete(notification)}
          className="justify-center px-3 bg-surface-light dark:bg-surface-dark"
          accessibilityLabel="Xóa thông báo"
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}
        >
          <Icon name="trash" size={18} color={colors.dark[300]} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
