import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CommentModal } from "@/components/post/CommentModal";
import { CreatePostButton } from "@/components/post/CreatePostButton";
import { PostCard } from "@/components/post/PostCard";
import {
  MessageIcon,
  PostIcon,
  ReportIcon,
  SearchIcon,
} from "@/components/shared/icons/Icons";
import { HomeSkeleton } from "@/components/skeleton";
import { Tab, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  FeedTab,
  PaginationDto,
  PostResponseDto,
  UserMinimalDto,
} from "@/dtos";
import { postService } from "@/services/post.service";

const FEED_TABS: { key: FeedTab; label: string }[] = [
  { key: "explore", label: "Khám phá" },
  { key: "friends", label: "Bạn bè" },
];

export default function HomeScreen() {
  const { profile, logout, setProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>("explore");
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

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

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}` as any);
  };

  const handleCreatePost = () => {
    router.push("/create-post" as any);
  };

  const handleSearch = () => {
    router.push("/search" as any);
  };

  const handleMessages = () => {
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
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-4">
        <ReportIcon size={48} color="#EF4444" />
        <Text className="mt-4 text-center">{error}</Text>
        <TouchableOpacity
          onPress={handleTryAgain}
          className="mt-4 bg-primary-400 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Đăng nhập lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-dark" edges={["top"]}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="px-4 pt-2 pb-3">
            {/* Header */}
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-[33px] leading-[38px] font-medium text-text-dark">
                Min<Text className="text-primary-100 font-bold">gle</Text>
              </Text>
              <View className="flex-row items-center gap-1">
                <TouchableOpacity onPress={handleSearch} className="p-2">
                  <SearchIcon size={23} color="#CFBFAD" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMessages} className="p-2">
                  <MessageIcon size={22} color="#CFBFAD" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Create Post Button */}
            <CreatePostButton user={userMinimal} onPress={handleCreatePost} />

            {/* Feed Tabs */}
            <View className="mt-3 flex-row gap-2">
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
            onUserPress={handleUserPress}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-0.5" />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#768D85"]}
            tintColor="#768D85"
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <PostIcon size={48} color="#9CA3AF" />
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
        contentContainerStyle={{ paddingBottom: 96 }}
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
