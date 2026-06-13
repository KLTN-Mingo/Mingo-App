import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/containers/ScreenContainer";
import { NotificationCard } from "@/components/notification";
import { TrashIcon } from "@/components/shared/icons/Icons";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { NotificationScreenSkeleton } from "@/components/skeleton";
import { BackHeader, Tab, Text } from "@/components/ui";
import { useNotification } from "@/context/NotificationContext";
import { NotificationResponseDto, NotificationType } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { notificationService } from "@/services/notification.service";
import { colors, getSemantic, getStatusColor } from "@/styles/colors";

type FilterType = "all" | "unread" | "follow" | "like" | "comment";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "follow", label: "Follow" },
  { key: "like", label: "Like" },
  { key: "comment", label: "Comment" },
];

export default function NotificationScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const semantic = getSemantic(colorScheme);
  const errorColor = getStatusColor(colorScheme, "error");
  const {
    count,
    notifications,
    markAsRead,
    markAllAsSeen,
    removeNotification,
    updateCount,
  } = useNotification();

  const [pagination, setPagination] = useState({ page: 1, hasMore: true });
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filteredNotifications, setFilteredNotifications] = useState<
    NotificationResponseDto[]
  >([]);
  const [localLoading, setLocalLoading] = useState(true);

  const fetchNotifications = useCallback(
    async (page: number = 1, append: boolean = false) => {
      setLocalLoading(true);
      try {
        let type: NotificationType | undefined;
        let isRead: boolean | undefined;

        switch (activeFilter) {
          case "unread":
            isRead = false;
            break;
          case "follow":
            type = NotificationType.FOLLOW_NEW;
            break;
          case "like":
            type = NotificationType.POST_LIKE;
            break;
          case "comment":
            type = NotificationType.POST_COMMENT;
            break;
        }

        const result = await notificationService.getNotifications(
          page,
          20,
          type,
          isRead
        );

        if (result && result.notifications) {
          setFilteredNotifications(
            append
              ? (prev: NotificationResponseDto[]) => [
                  ...prev,
                  ...result.notifications,
                ]
              : result.notifications
          );
          setPagination({
            page: result.pagination?.page ?? 1,
            hasMore: result.pagination?.hasMore ?? false,
          });
        } else {
          setFilteredNotifications([]);
          setPagination({ page: 1, hasMore: false });
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setFilteredNotifications([]);
        setPagination({ page: 1, hasMore: false });
      } finally {
        setRefreshing(false);
        setLoadingMore(false);
        setLocalLoading(false);
      }
    },
    [activeFilter]
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  useEffect(() => {
    // Mark all as seen when screen opens
    markAllAsSeen();
  }, [markAllAsSeen]);

  useEffect(() => {
    setFilteredNotifications(notifications);
  }, [notifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(1);
  };

  const onLoadMore = () => {
    if (loadingMore || !pagination.hasMore) return;
    setLoadingMore(true);
    fetchNotifications(pagination.page + 1, true);
  };

  const handleNotificationPress = async (
    notification: NotificationResponseDto
  ) => {
    // Mark as read
    await markAsRead(notification.id);

    // Navigate based on notification type
    const { notificationType, postId, actor, entityId, entityType } =
      notification;

    switch (notificationType) {
      case NotificationType.POST_LIKE:
      case NotificationType.POST_COMMENT:
      case NotificationType.POST_SHARE:
      case NotificationType.POST_MENTION:
        if (postId) router.push(`/post/${postId}` as any);
        break;
      case NotificationType.MEDIA_LIKE:
      case NotificationType.MEDIA_COMMENT:
      case NotificationType.MEDIA_SHARE:
      case NotificationType.COMMENT_LIKE:
      case NotificationType.COMMENT_REPLY:
      case NotificationType.COMMENT_MENTION:
        if (postId) {
          router.push(`/post/${postId}` as any);
        }
        break;
      case NotificationType.FOLLOW_REQUEST:
      case NotificationType.FOLLOW_ACCEPTED:
      case NotificationType.FOLLOW_NEW:
      case NotificationType.CLOSE_FRIEND_REQUEST:
      case NotificationType.CLOSE_FRIEND_ACCEPTED:
        if (actor?.id) router.push(`/profile/${actor.id}` as any);
        break;
      case NotificationType.MESSAGE_NEW: {
        // Deep link tới chat — entityId thường là boxId hoặc conversationId.
        const boxId =
          entityId ?? (entityType === "message" ? entityId : undefined);
        if (boxId) router.push(`/chat/${boxId}` as any);
        else router.push("/chat" as any);
        break;
      }
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      const newCount = { ...count, unread: 0 };
      updateCount(newCount);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDeleteNotification = (notification: NotificationResponseDto) => {
    Alert.alert("Delete this notification?", undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await notificationService.deleteNotification(notification.id);
            removeNotification(notification.id);
            updateCount({
              ...count,
              total: Math.max(0, count.total - 1),
              unread: !notification.isRead
                ? Math.max(0, count.unread - 1)
                : count.unread,
            });
          } catch (error) {
            console.error("Error deleting notification:", error);
          }
        },
      },
    ]);
  };

  const handleDeleteAll = () => {
    Alert.alert(
      "Delete all notifications",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await notificationService.deleteAll();
              updateCount({ total: 0, unread: 0, unseen: 0 });
            } catch (error) {
              console.error("Error deleting all notifications:", error);
            }
          },
        },
      ]
    );
  };

  if (localLoading) {
    return <NotificationScreenSkeleton />;
  }

  return (
    <ScreenContainer
      className="gap-4"
      style={{ backgroundColor: semantic.background }}
    >
      <BackHeader
        title="Notifications"
        titleClassName="leading-[32px]"
        rightSlot={
          <TouchableOpacity
            onPress={handleDeleteAll}
            className="w-9 h-9 rounded-full items-center justify-center bg-component-light dark:bg-component-dark"
            activeOpacity={0.72}
          >
            <TrashIcon size={22} color={errorColor} />
          </TouchableOpacity>
        }
      />

      {count.unread > 0 && (
        <View className="self-start">
          <View className="bg-primary rounded-full px-3 py-1">
            <Text className="text-white text-xs font-semibold">
              {count.unread > 99 ? "99+" : count.unread} unread
            </Text>
          </View>
        </View>
      )}

      <View className="-mx-1">
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
          renderItem={({ item }) => (
            <Tab
              content={item.label}
              isActive={activeFilter === item.key}
              onClick={() => setActiveFilter(item.key)}
              badge={
                item.key === "unread" && count.unread ? count.unread : undefined
              }
            />
          )}
        />
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={handleNotificationPress}
            onDelete={handleDeleteNotification}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-2" />}
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.light]}
            tintColor={colors.primary.light}
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<EmptyState title="No notifications" />}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <Text variant="muted">Loading more...</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}
