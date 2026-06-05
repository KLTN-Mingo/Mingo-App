import React from "react";
import { Image, TouchableOpacity, View } from "react-native";

import { TrashIcon } from "@/components/shared/icons/Icons";
import { Avatar, Icon, Text } from "@/components/ui";
import { useTheme } from "@/context/ThemeContext";
import {
  getNotificationMessage,
  NotificationResponseDto,
  NotificationType,
} from "@/dtos";
import { getSemantic, paletteIcon, statusColors } from "@/styles/colors";

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
      name: "heart.fill",
      color: statusColors.error.light,
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    [NotificationType.POST_COMMENT]: {
      name: "bubble.left.fill",
      color: statusColors.info.light,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    [NotificationType.POST_SHARE]: {
      name: "arrowshape.turn.up.right.fill",
      color: statusColors.success.light,
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    [NotificationType.POST_MENTION]: {
      name: "at",
      color: statusColors.info.light,
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    [NotificationType.MEDIA_LIKE]: {
      name: "heart.fill",
      color: statusColors.error.light,
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    [NotificationType.MEDIA_COMMENT]: {
      name: "bubble.left.fill",
      color: statusColors.info.light,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    [NotificationType.COMMENT_LIKE]: {
      name: "heart.fill",
      color: statusColors.error.light,
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    [NotificationType.COMMENT_REPLY]: {
      name: "arrowshape.turn.up.left.fill",
      color: statusColors.info.light,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    [NotificationType.COMMENT_MENTION]: {
      name: "at",
      color: statusColors.info.light,
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    [NotificationType.FOLLOW_REQUEST]: {
      name: "person.badge.plus",
      color: statusColors.warning.light,
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    [NotificationType.FOLLOW_ACCEPTED]: {
      name: "person.fill.checkmark",
      color: statusColors.success.light,
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    [NotificationType.FOLLOW_NEW]: {
      name: "person.fill.badge.plus",
      color: "#768D85",
      bgColor: "bg-primary/20 dark:bg-primary/30",
    },
    [NotificationType.CLOSE_FRIEND_REQUEST]: {
      name: "star.fill",
      color: statusColors.warning.light,
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    [NotificationType.CLOSE_FRIEND_ACCEPTED]: {
      name: "star.fill",
      color: statusColors.success.light,
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    [NotificationType.MESSAGE_NEW]: {
      name: "envelope.fill",
      color: statusColors.info.light,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    [NotificationType.SYSTEM]: {
      name: "bell.fill",
      color: "#6B6B6B",
      bgColor: "bg-gray-100 dark:bg-gray-800",
    },
  };

  return (
    icons[type] || {
      name: "bell.fill",
      color: "#768D85",
      bgColor: "bg-primary/20 dark:bg-primary/30",
    }
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

export function NotificationCard({
  notification,
  onPress,
  onDelete,
}: NotificationCardProps) {
  const { colorScheme } = useTheme();
  const semantic = getSemantic(colorScheme);
  const iconMutedColor = paletteIcon[colorScheme];

  const { actor, notificationType, content, thumbnailUrl, isRead, createdAt } =
    notification;

  const icon = getNotificationIcon(notificationType);
  const message = getNotificationMessage(notificationType, actor?.name);
  const timeAgo = getTimeAgo(createdAt);

  return (
    <View
      className={`flex-row items-stretch rounded-lg ${
        isRead
          ? "bg-component-light dark:bg-component-dark"
          : "bg-primary/10 dark:bg-primary/15"
      }`}
    >
      <TouchableOpacity
        onPress={() => onPress?.(notification)}
        activeOpacity={0.72}
        className="flex-1 flex-row items-start px-3 py-3"
      >
        <View className="relative">
          <Avatar
            source={actor?.avatar ? { uri: actor.avatar } : undefined}
            fallback={actor?.name}
            size="md"
          />
          <View
            className={`absolute -bottom-1 -right-1 rounded-full p-1 ${icon.bgColor}`}
            style={{ borderWidth: 2, borderColor: semantic.surface }}
          >
            <Icon name={icon.name} size={12} color={icon.color} />
          </View>
        </View>

        <View className="flex-1 ml-3 min-w-0">
          <Text
            className={`text-text-light dark:text-text-dark ${
              !isRead ? "font-semibold" : ""
            }`}
            numberOfLines={2}
            style={{ fontSize: 14, lineHeight: 20 }}
          >
            {message}
          </Text>

          {content ? (
            <Text variant="muted" numberOfLines={1} className="mt-0.5 text-sm">
              &quot;{content}&quot;
            </Text>
          ) : null}

          <Text variant="muted" className="text-xs mt-1" style={{ lineHeight: 16 }}>
            {timeAgo}
          </Text>
        </View>

        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            className="w-12 h-12 rounded-lg ml-2"
            resizeMode="cover"
          />
        ) : null}

        {!isRead ? (
          <View className="w-2 h-2 rounded-full bg-primary ml-2 mt-1.5 self-start" />
        ) : null}
      </TouchableOpacity>

      {onDelete ? (
        <TouchableOpacity
          onPress={() => onDelete(notification)}
          className="justify-center px-3"
          accessibilityLabel="Delete notification"
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}
          activeOpacity={0.72}
        >
          <TrashIcon size={20} color={iconMutedColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
