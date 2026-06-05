import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { Avatar, Text } from "@/components/ui";
import { paletteDark, paletteLight } from "@/constants/designTokens";
import { PostResponseDto } from "@/dtos";
import { postService } from "@/services/post.service";

const ITEM_WIDTH = 220;
const ITEM_HEIGHT = 160;

/**
 * Carousel "Đang hot" — kéo ngang ở đầu home/explore.
 * Tự fetch trending khi mount, fail silent (chỉ ẩn nếu lỗi).
 */
export function TrendingPostsRow() {
  const isDark = useColorScheme() === "dark";
  const colors = isDark ? paletteDark : paletteLight;
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await postService.getTrendingPosts();
        if (!cancelled) {
          setPosts(Array.isArray(data) ? data.slice(0, 10) : []);
        }
      } catch (err) {
        console.warn("[trending] load failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View style={{ height: ITEM_HEIGHT + 60 }} className="items-center justify-center">
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  if (!posts.length) return null;

  return (
    <View>
      <View className="flex-row items-center justify-between px-1 mb-2">
        <Text className="text-base font-semibold text-text-light dark:text-text-dark">
          Đang hot
        </Text>
        <View className="px-2 py-0.5 rounded-full bg-primary/10">
          <Text className="text-xs font-semibold" style={{ color: "#2E8B7B" }}>
            🔥 Trending
          </Text>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 2, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/post/${item.id}` as never)}
            style={{ width: ITEM_WIDTH }}
            className="rounded-2xl overflow-hidden bg-surface-light dark:bg-surface-dark"
          >
            {item.media?.[0]?.mediaUrl ? (
              <Image
                source={{ uri: item.media[0].mediaUrl }}
                style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: ITEM_WIDTH,
                  height: ITEM_HEIGHT,
                  backgroundColor: colors.surfaceMuted,
                }}
                className="items-center justify-center px-3"
              >
                <Text numberOfLines={4} style={{ color: colors.textPrimary }}>
                  {item.contentText || "Bài viết không có nội dung"}
                </Text>
              </View>
            )}
            <View className="px-3 py-2.5">
              <View className="flex-row items-center mb-1">
                <Avatar
                  source={item.user?.avatar ? { uri: item.user.avatar } : undefined}
                  fallback={item.user?.name}
                  size="sm"
                />
                <Text
                  className="ml-2 flex-1 text-sm font-semibold text-text-light dark:text-text-dark"
                  numberOfLines={1}
                >
                  {item.user?.name || "User"}
                </Text>
              </View>
              <Text variant="muted" className="text-xs">
                {item.likesCount} likes · {item.commentsCount} comments
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
