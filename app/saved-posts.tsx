import { Stack, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PostCard } from "@/components/post/PostCard";
import { PostIcon } from "@/components/shared/icons/Icons";
import { Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { PostResponseDto, UserMinimalDto } from "@/dtos";
import { postService } from "@/services/post.service";
import { colors, getSemantic } from "@/styles/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";

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
      Alert.alert("Bài viết của bạn", undefined, [
        {
          text: "Chỉnh sửa",
          onPress: () =>
            router.push({
              pathname: "/create-post",
              params: { id: post.id },
            } as any),
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
            await postService.submitFeedFeedback(post.id, "not_interested");
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
            await postService.submitFeedFeedback(post.id, "see_more");
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Không gửi được phản hồi";
            Alert.alert("Lỗi", msg);
          }
        },
      },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      edges={["bottom"]}
    >
      <Stack.Screen options={{ title: "Đã lưu" }} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[100]} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
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
            <View className="items-center justify-center py-20">
              <PostIcon size={48} color={semantic.placeholder} />
              <Text variant="muted" className="mt-4 text-center px-6">
                Chưa có bài viết đã lưu
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
