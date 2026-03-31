import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationCard } from '@/components/notification';
import { NotificationScreenSkeleton } from '@/components/skeleton';
import { Tab, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  NotificationCountDto,
  NotificationResponseDto,
  NotificationType,
  PaginationDto,
} from '@/dtos';
import {
  CircleTickIcon,
  NotificationIcon,
  TrashIcon,
} from '@/components/shared/icons/Icons';
import { notificationService } from '@/services/notification.service';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, getSemantic, getStatusColor } from '@/styles/colors';

type FilterType = 'all' | 'unread' | 'follow' | 'like' | 'comment';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
  { key: 'follow', label: 'Theo dõi' },
  { key: 'like', label: 'Lượt thích' },
  { key: 'comment', label: 'Bình luận' },
];

export default function NotificationScreen() {
  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const semantic = getSemantic(colorScheme);
  const errorColor = getStatusColor(colorScheme, 'error');
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [count, setCount] = useState<NotificationCountDto | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(
    async (page: number = 1, append: boolean = false) => {
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

        if (append) {
          setNotifications((prev) => [...prev, ...result.notifications]);
        } else {
          setNotifications(result.notifications);
        }
        setPagination(result.pagination);

        // Get count
        const countData = await notificationService.getNotificationCount();
        setCount(countData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [activeFilter]
  );

  useEffect(() => {
    setLoading(true);
    fetchNotifications(1);
  }, [fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(1);
  };

  const onLoadMore = () => {
    if (loadingMore || !pagination?.hasMore) return;
    setLoadingMore(true);
    fetchNotifications(pagination.page + 1, true);
  };

  const handleNotificationPress = async (notification: NotificationResponseDto) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        if (count) {
          setCount({ ...count, unread: Math.max(0, count.unread - 1) });
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type
    const { notificationType, entityId, postId, mediaId, commentId, actor } = notification;

    switch (notificationType) {
      case NotificationType.POST_LIKE:
      case NotificationType.POST_COMMENT:
      case NotificationType.POST_SHARE:
      case NotificationType.POST_MENTION:
        if (postId) router.push(`/post/${postId}` as any);
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
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (count) {
        setCount({ ...count, unread: 0 });
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Xóa tất cả thông báo',
      'Bạn có chắc chắn muốn xóa tất cả thông báo?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteAll();
              setNotifications([]);
              setCount({ total: 0, unread: 0, unseen: 0 });
            } catch (error) {
              console.error('Error deleting all notifications:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <NotificationScreenSkeleton />;
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      edges={['top']}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Text variant="title" className="text-xl">
            Thông báo
          </Text>
          {count && count.unread > 0 && (
            <View className="bg-primary-500 rounded-full px-2 py-0.5">
              <Text className="text-white text-xs font-semibold">
                {count.unread > 99 ? '99+' : count.unread}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            className="p-2"
            disabled={!count || count.unread === 0}
          >
            <CircleTickIcon
              size={24}
              color={count && count.unread > 0 ? colors.primary[100] : semantic.placeholder}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAll} className="p-2">
            <TrashIcon size={24} color={errorColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="px-4 pb-2">
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
                item.key === 'unread' && count?.unread
                  ? count.unread
                  : undefined
              }
            />
          )}
        />
      </View>

      {/* Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={handleNotificationPress}
          />
        )}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-border-light dark:bg-border-dark" />
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
          <View className="flex-1 items-center justify-center py-20">
            <NotificationIcon size={64} color={semantic.placeholder} />
            <Text variant="muted" className="mt-4 text-center">
              Không có thông báo nào
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <Text variant="muted">Đang tải thêm...</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
