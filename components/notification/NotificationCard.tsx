import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

import { Avatar, Icon, Text } from '@/components/ui';
import {
  getNotificationMessage,
  NotificationResponseDto,
  NotificationType,
} from '@/dtos';
import { paletteIcon, statusColors } from '@/styles/colors';
import { useTheme } from '@/context/ThemeContext';

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
      color: '#768D85',
      bgColor: 'bg-primary/20 dark:bg-primary/30',
    },
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
    [NotificationType.MESSAGE_NEW]: {
      name: 'envelope.fill',
      color: statusColors.info.light,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    [NotificationType.SYSTEM]: {
      name: 'bell.fill',
      color: '#6B6B6B',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
  };

  return (
    icons[type] || {
      name: 'bell.fill',
      color: '#768D85',
      bgColor: 'bg-primary/20 dark:bg-primary/30',
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
  const { colorScheme } = useTheme();
  const iconMutedColor = paletteIcon[colorScheme];

  const { actor, notificationType, content, thumbnailUrl, isRead, createdAt } =
    notification;

  const icon = getNotificationIcon(notificationType);
  const message = getNotificationMessage(notificationType, actor?.name);
  const timeAgo = getTimeAgo(createdAt);

  return (
    <View className="flex-row items-stretch bg-background-light dark:bg-background-dark">
      <TouchableOpacity
        onPress={() => onPress?.(notification)}
        activeOpacity={0.7}
        className="flex-1 flex-row items-start p-4"
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
          <Text className={`text-text-light dark:text-text-dark ${!isRead ? 'font-bold' : ''}`} numberOfLines={2}>
            {message}
          </Text>

          {content && (
            <Text variant="muted" numberOfLines={1} className="mt-0.5 text-sm">
              &quot;{content}&quot;
            </Text>
          )}

          <Text
            variant="muted"
            className="text-xs mt-1"
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

        {/* Unread dot */}
        {!isRead && (
          <View className="w-2 h-2 rounded-sm bg-primary ml-2 mt-1 self-start" />
        )}
      </TouchableOpacity>

      {onDelete ? (
        <TouchableOpacity
          onPress={() => onDelete(notification)}
          className="justify-center px-3 bg-background-light dark:bg-background-dark"
          accessibilityLabel="Xóa thông báo"
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}
        >
          <Icon name="trash" size={18} color={iconMutedColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
