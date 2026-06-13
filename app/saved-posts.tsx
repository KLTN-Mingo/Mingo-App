import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/containers/ScreenContainer";
import { PostCard } from "@/components/post/PostCard";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { BackHeader } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { PaginationDto, PostResponseDto, UserMinimalDto } from "@/dtos";
import { useSharePost } from "@/hooks/use-share-post";
import { postService } from "@/services/post.service";
import { colors } from "@/styles/colors";

export default function SavedPostsScreen() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const userMinimal: UserMinimalDto | null = profile
    ? {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        verified: profile.verified,
      }
    : null;

  const load = useCallback(async (page = 1, append = false) => {
    try {
      const data = await postService.getSavedPosts(page, 20);
      setPagination(data.pagination);
      if (append) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
    } catch (e) {
      console.warn("Cannot load saved posts:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(1, false);
  };

  const onLoadMore = () => {
    if (loadingMore || !pagination?.hasMore) return;
    setLoadingMore(true);
    load((pagination.page ?? 1) + 1, true);
  };

  const handleSaveChange = (
    postId: string,
    isSaved: boolean,
    savesCount: number
  ) => {
    if (!isSaved) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      return;
    }
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved, savesCount } : p))
    );
  };

  const share = useSharePost({
    currentUserId: profile?.id,
    onShared: ({ postId, sentCount }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, sharesCount: p.sharesCount + sentCount } : p
        )
      );
    },
    onReposted: ({ postId }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p
        )
      );
    },
  });

  const handlePostMorePress = (post: PostResponseDto) => {
    if (!profile) return;

    if (post.userId === profile.id) {
      Alert.alert("Your post", undefined, [
        {
          text: "Edit",
          onPress: () =>
            router.push({
              pathname: "/create-post",
              params: { id: post.id },
            } as any),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Delete post?", "This action cannot be undone.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  try {
                    await postService.deletePost(post.id);
                    setPosts((prev) => prev.filter((p) => p.id !== post.id));
                  } catch (e: unknown) {
                    const msg = e instanceof Error ? e.message : "Cannot delete";
                    Alert.alert("Error", msg);
                  }
                },
              },
            ]);
          },
        },
        { text: "Close", style: "cancel" },
      ]);
      return;
    }

    Alert.alert("Post", undefined, [
      {
        text: "Hide post",
        onPress: async () => {
          try {
            await postService.submitFeedFeedback(post.id, "hide");
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Cannot send feedback";
            Alert.alert("Error", msg);
          }
        },
      },
      {
        text: "Not interested",
        onPress: async () => {
          try {
            await postService.submitFeedFeedback(post.id, "not_interested");
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Cannot send feedback";
            Alert.alert("Error", msg);
          }
        },
      },
      {
        text: "See more like this",
        onPress: async () => {
          try {
            await postService.submitFeedFeedback(post.id, "see_more");
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Cannot send feedback";
            Alert.alert("Error", msg);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (!profile) {
    return null;
  }

  return (
      <ScreenContainer className="gap-4">
        <BackHeader title="Saved" />
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary[100]} />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 32 }}
            ItemSeparatorComponent={() => <View className="h-4" />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary[100]]}
                tintColor={colors.primary[100]}
              />
            }
            renderItem={({ item }) => (
              <PostCard
                post={item}
                currentUser={userMinimal}
                onLikeChange={(postId, isLiked) => {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === postId
                        ? {
                            ...p,
                            isLiked,
                            likesCount: isLiked
                              ? p.likesCount + 1
                              : p.likesCount - 1,
                          }
                        : p
                    )
                  );
                }}
                onCommentPress={(postId) => router.push(`/post/${postId}` as any)}
                onShareChange={(postId, nextCount) => {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === postId ? { ...p, sharesCount: nextCount } : p
                    )
                  );
                }}
                onSharePress={share.openSheet}
                onSaveChange={handleSaveChange}
                onUserPress={(userId) => router.push(`/profile/${userId}` as any)}
                onMorePress={handlePostMorePress}
              />
            )}
            ListEmptyComponent={
              <EmptyState title="No saved posts" />
            }
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View className="py-4 items-center">
                  <ActivityIndicator color={colors.primary[100]} />
                </View>
              ) : null
            }
          />
        )}

        {share.modals}
      </ScreenContainer>
  );
}
