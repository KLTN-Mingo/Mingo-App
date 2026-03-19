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
import { Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { PostResponseDto, UserMinimalDto } from "@/dtos";
import { postService } from "@/services/post.service";

export default function HomeScreen() {
  const { profile, logout, setProfile } = useAuth();
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchPosts = useCallback(async () => {
    try {
      setError(null);
      const data = await postService.getAllPosts();
      setPosts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      fetchPosts();
    }
  }, [profile, fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
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
    router.push("/chat" as any);
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
    <SafeAreaView className="flex-1 bg-[#F3F4F3]" edges={["top"]}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="px-4 pt-2 pb-3">
            {/* Header */}
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-[33px] leading-[38px] font-medium text-[#1E2021]">
                Min<Text className="text-primary-400 font-bold">gle</Text>
              </Text>
              <View className="flex-row items-center gap-1">
                <TouchableOpacity onPress={handleSearch} className="p-2">
                  <SearchIcon size={23} color="#1E2021" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMessages} className="p-2">
                  <MessageIcon size={22} color="#1E2021" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Create Post Button */}
            <CreatePostButton user={userMinimal} onPress={handleCreatePost} />
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
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <PostIcon size={48} color="#9CA3AF" />
            <Text variant="muted" className="mt-4">
              No posts yet
            </Text>
          </View>
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
