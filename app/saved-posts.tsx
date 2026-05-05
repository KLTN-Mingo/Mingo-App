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
import { Text } from "@/components/ui";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { PostResponseDto, UserMinimalDto } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { postService } from "@/services/post.service";
import { colors, getSemantic } from "@/styles/colors";

export default function SavedPostsScreen() {
  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const semantic = getSemantic(colorScheme);
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userMinimal: UserMinimalDto | null = profile
    ? {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        verified: profile.verified,
      }
    : null;

  const load = useCallback(async () => {
    try {
      const data = await postService.getSavedPosts(1, 50);
      setPosts(data.posts);
    } catch (e) {
      console.warn("Cannot load saved posts:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  const handleSaveChange = (postId: string, isSaved: boolean) => {
    if (!isSaved) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      return;
    }
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved } : p))
    );
  };

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
        <PageHeader title="Saved" />
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
                onSaveChange={handleSaveChange}
                onUserPress={(userId) => router.push(`/profile/${userId}` as any)}
                onMorePress={handlePostMorePress}
              />
            )}
            ListEmptyComponent={
              <EmptyState title="No saved posts" />
            }
          />
        )}
      </ScreenContainer>
  );
}
