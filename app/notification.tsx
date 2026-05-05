import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';

import { ScreenContainer } from '@/components/containers/ScreenContainer';
import { EmptyState } from '@/components/shared/ui/EmptyState';
import { NotificationCard } from '@/components/notification';
import {
  CircleTickIcon,
  TrashIcon,
} from '@/components/shared/icons/Icons';
import { NotificationScreenSkeleton } from '@/components/skeleton';
import { Tab, Text } from '@/components/ui';
import { PageHeader } from '@/components/ui/PageHeader';
import { useNotification } from '@/context/NotificationContext';
import {
  NotificationResponseDto,
  NotificationType,
} from '@/dtos';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { notificationService } from '@/services/notification.service';
import { colors, getSemantic, getStatusColor } from '@/styles/colors';

type FilterType = 'all' | 'unread' | 'follow' | 'like' | 'comment';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'follow', label: 'Follow' },
  { key: 'like', label: 'Like' },
  { key: 'comment', label: 'Comment' },
];

export default function NotificationScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const semantic = getSemantic(colorScheme);
  const errorColor = getStatusColor(colorScheme, 'error');
  const {
    count,
    notifications,
    isLoading: contextLoading,
    markAsRead,
    markAllAsSeen,
    refreshNotifications,
    removeNotification,
    updateCount,
  } = useNotification();

  const [pagination, setPagination] = useState({ page: 1, hasMore: true });
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationResponseDto[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  const fetchNotifications = useCallback(
    async (page: number = 1, append: boolean = false) => {
      setLocalLoading(true);
      try {
        let type: NotificationType | undefined;
        let isRead: boolean | undefined;

        switch (activeFilter) {
          case 'unread':
            isRead = false;
            break;
          case 'follow':
            type = NotificationType.FOLLOW_NEW;
            break;
          case 'like':
            type = NotificationType.POST_LIKE;
            break;
          case 'comment':
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
              ? (prev: NotificationResponseDto[]) => [...prev, ...result.notifications]
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
        console.error('Error fetching notifications:', error);
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

  const handleNotificationPress = async (notification: NotificationResponseDto) => {
    // Mark as read
    await markAsRead(notification.id);

    // Navigate based on notification type
    const { notificationType, postId, actor } = notification;

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
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = (notification: NotificationResponseDto) => {
    Alert.alert('Delete this notification?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
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
            console.error('Error deleting notification:', error);
          }
        },
      },
    ]);
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete all notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteAll();
              updateCount({ total: 0, unread: 0, unseen: 0 });
            } catch (error) {
              console.error('Error deleting all notifications:', error);
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
      <ScreenContainer className="gap-4">
        <PageHeader title="Notifications" />

        {/* Actions row */}
        <View className="flex-row items-center justify-end gap-2">
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            className="p-2"
            disabled={count.unread === 0}
          >
            <CircleTickIcon
              size={22}
              color={count.unread > 0 ? colors.primary[100] : semantic.placeholder}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAll} className="p-2">
            <TrashIcon size={22} color={errorColor} />
          </TouchableOpacity>
        </View>

        {/* Unread count badge */}
        {count.unread > 0 && (
          <View className="self-start">
            <View className="bg-primary-100 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-semibold">
                {count.unread > 99 ? '99+' : count.unread} unread
              </Text>
            </View>
          </View>
        )}

        {/* Filter Tabs */}
        <View>
          <FlatList
            data={FILTERS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.key}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => (
              <Tab
                content={item.label}
                isActive={activeFilter === item.key}
                onClick={() => setActiveFilter(item.key)}
                badge={
                  item.key === 'unread' && count.unread
                    ? count.unread
                    : undefined
                }
              />
            )}
          />
        </View>

        {/* Notification List */}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary[100]]}
              tintColor={colors.primary[100]}
            />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
              <EmptyState title="No notifications" />
          }
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
