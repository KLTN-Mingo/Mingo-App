import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { CommentModal } from "@/components/post/CommentModal";
import { PostCard } from "@/components/post/PostCard";
import {
  NotificationIcon,
  PostIcon,
  ReportIcon,
} from "@/components/shared/icons/Icons";
import { SearchBarTrigger } from "@/components/shared/ui/search-bar";
import { HomeSkeleton } from "@/components/skeleton";
import { Tab, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  FeedTab,
  NotificationCountDto,
  PaginationDto,
  PostResponseDto,
  UserMinimalDto,
} from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { postService } from "@/services/post.service";
import { notificationService } from "@/services/notification.service";
import { colors, getSemantic, getStatusColor } from "@/styles/colors";

const FEED_TABS: { key: FeedTab; label: string }[] = [
  { key: "explore", label: "Khám phá" },
  { key: "friends", label: "Bạn bè" },
];

/** Khoảng đệm dưới khi tab bar nổi (BAR_HEIGHT + offset) — khớp app/(tabs)/_layout */
const TAB_BAR_FLOAT_RESERVE = 64 + 20 + 20;

export default function HomeScreen() {
  const { profile, logout, setProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const semantic = getSemantic(colorScheme);
  const errorColor = getStatusColor(colorScheme, "error");
  const [activeTab, setActiveTab] = useState<FeedTab>("explore");
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState<NotificationCountDto | null>(null);

  // Convert profile to UserMinimalDto for components
  const userMinimal: UserMinimalDto | null = profile
    ? {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        verified: profile.verified,
      }
    : null;

  const fetchPosts = useCallback(
    async (
      page: number = 1,
      append: boolean = false,
      tab: FeedTab = activeTab
    ) => {
      try {
        if (!append) {
          setError(null);
        }

        const data = await postService.getFeedPosts(page, 20, tab);

        if (append) {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }
        setPagination(data.pagination);
      } catch (err: any) {
        if (!append) {
          setError(err.message || "Failed to load posts");
        }
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    if (profile) {
      setLoading(true);
      fetchPosts(1, false, activeTab);
    }
  }, [profile, activeTab, fetchPosts]);

  useEffect(() => {
    const loadNotificationCount = async () => {
      try {
        const count = await notificationService.getNotificationCount();
        setNotificationCount(count);
      } catch (error) {
        console.warn("Cannot load notification count:", error);
      }
    };
    loadNotificationCount();
  }, [activeTab, profile?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(1, false, activeTab);
  };

  const handleTabChange = (tab: FeedTab) => {
    if (tab === activeTab) return;
    setPosts([]);
    setPagination(null);
    setActiveTab(tab);
  };

  const onLoadMore = () => {
    if (loadingMore || !pagination?.hasMore) return;
    setLoadingMore(true);
    fetchPosts(pagination.page + 1, true, activeTab);
  };

  const handleLikeChange = (postId: string, isLiked: boolean) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked,
              likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1,
            }
          : p
      )
    );
  };

  const handleCommentPress = (postId: string) => {
    setCommentPostId(postId);
  };

  const handleCommentCountChange = (postId: string, delta: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + delta } : p
      )
    );
  };

  const handleShareChange = (postId: string, nextCount: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, sharesCount: nextCount } : p))
    );
  };

  const handleSaveChange = (postId: string, isSaved: boolean) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved } : p))
    );
  };

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}` as any);
  };

  const handlePostMorePress = (post: PostResponseDto) => {
    if (!profile) return;

    if (post.userId === profile.id) {
      Alert.alert("Bài viết của bạn", undefined, [
        {
          text: "Chỉnh sửa",
          onPress: () =>
            router.push({ pathname: "/create-post", params: { id: post.id } } as any),
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            Alert.alert("Xóa bài viết?", "Hành động này không hoàn tác.", [
              { text: "Hủy", style: "cancel" },
              {
                text: "Xóa",
                style: "destructive",
                onPress: async () => {
                  try {
                    await postService.deletePost(post.id);
                    setPosts((prev) => prev.filter((p) => p.id !== post.id));
                  } catch (e: unknown) {
                    const msg = e instanceof Error ? e.message : "Không xóa được";
                    Alert.alert("Lỗi", msg);
                  }
                },
              },
            ]);
          },
        },
        { text: "Đóng", style: "cancel" },
      ]);
      return;
    }

    Alert.alert("Bài viết", undefined, [
      {
        text: "Không quan tâm",
        onPress: async () => {
          try {
            await postService.submitFeedFeedback(
              post.id,
              "not_interested",
              activeTab
            );
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Không gửi được phản hồi";
            Alert.alert("Lỗi", msg);
          }
        },
      },
      {
        text: "Muốn xem thêm tương tự",
        onPress: async () => {
          try {
            await postService.submitFeedFeedback(post.id, "see_more", activeTab);
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Không gửi được phản hồi";
            Alert.alert("Lỗi", msg);
          }
        },
      },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  const handleCreatePost = () => {
    router.push("/create-post" as any);
  };

  const handleSearch = () => {
    router.push("/search" as any);
  };

  const handleNotifications = () => {
    router.push("/(tabs)/notification" as any);
  };

  // Loading state
  if (loading) {
    return <HomeSkeleton />;
  }

  // Error state -> đăng xuất rồi chuyển đến màn đăng nhập
  if (error) {
    const handleTryAgain = async () => {
      try {
        await logout();
      } catch {
        setProfile(null);
      }
      router.replace("/(auth)/signin" as any);
    };

    return (
      <SafeAreaView
        className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-4"
        edges={["top", "left", "right"]}
        style={{ paddingBottom: TAB_BAR_FLOAT_RESERVE + insets.bottom }}
      >
        <ReportIcon size={48} color={errorColor} />
        <Text className="mt-4 text-center">{error}</Text>
        <TouchableOpacity
          onPress={handleTryAgain}
          className="mt-4 bg-primary-100 px-6 py-3 rounded-xl"
        >
          <Text className="text-primary-foreground-light font-semibold">
            Đăng nhập lại
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 px-5 py-8"
      edges={["top"]}
    >
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        className="gap-6"
        ListHeaderComponent={
          <View className="gap-5 mb-5">
            {/* Header: logo + thông báo */}
            <View className="flex-row items-center justify-between">
              <Text className="text-[33px] leading-[38px] font-jost">
                <Text className="font-montserrat-bold text-text-light dark:text-text-dark">
                  Min
                </Text>
                <Text className="text-[22px] leading-[23px] text-primary-100 dark:text-primary-100">
                  go
                </Text>
              </Text>
              <TouchableOpacity
                onPress={handleNotifications}
                className="p-2 relative"
                // hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <NotificationIcon size={24} color={semantic.text} />
                {Boolean(notificationCount?.unread) && notificationCount!.unread > 0 && (
                  <View className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full px-1 bg-error-light dark:bg-error-dark border border-white dark:border-background-dark items-center justify-center">
                    <Text className="text-[10px] leading-[10px] text-white font-semibold">
                      {notificationCount!.unread > 99 ? "99+" : notificationCount!.unread}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <SearchBarTrigger onPress={handleSearch} />

            {/* Feed Tabs */}
            <View className="flex-row gap-2">
              {FEED_TABS.map((tab) => (
                <Tab
                  key={tab.key}
                  content={tab.label}
                  isActive={activeTab === tab.key}
                  onClick={() => handleTabChange(tab.key)}
                />
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUser={userMinimal}
            onLikeChange={handleLikeChange}
            onCommentPress={handleCommentPress}
            onShareChange={handleShareChange}
            onSaveChange={handleSaveChange}
            onUserPress={handleUserPress}
            onMorePress={handlePostMorePress}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
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
            <PostIcon size={48} color={semantic.placeholder} />
            <Text variant="muted" className="mt-4">
              {activeTab === "explore"
                ? "Chưa có bài viết để khám phá"
                : "Chưa có bài viết từ bạn bè"}
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
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      <CommentModal
        postId={commentPostId}
        onClose={() => setCommentPostId(null)}
        onCommentCountChange={handleCommentCountChange}
      />
    </SafeAreaView>
  );
}
