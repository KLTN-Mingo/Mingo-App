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

import { Avatar } from "@/components/ui";
import { Text } from "@/components/ui/Text";
import { paletteDark, paletteLight } from "@/constants/designTokens";
import { PostResponseDto } from "@/dtos";
import { postService } from "@/services/post.service";

const ITEM_WIDTH = 220;
const ITEM_HEIGHT = 160;

/**
 * Carousel "Trending" — kéo ngang ở đầu home/explore.
 * Tự fetch trending khi mount, fail silent (chỉ ẩn nếu lỗi).
 */
export function TrendingPostsRow() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
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
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View
        style={{ height: ITEM_HEIGHT + 60 }}
        className="items-center justify-center"
      >
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  if (!posts.length) return null;

  return (
    <View>
      <View className="flex-row items-center justify-between px-1 mb-2">
        <Text className="text-base font-semibold text-text-light dark:text-text-dark">
          Trending
        </Text>

        <View className="px-2 py-0.5 rounded-full bg-primary/10">
          <Text className="text-xs font-semibold text-title-light">
            🔥 Trending
          </Text>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingVertical: 8,
          gap: 12,
        }}
        renderItem={({ item }) => (
          <View
            style={[
              {
                width: ITEM_WIDTH,
                borderRadius: 16,
                borderColor: isDark ? colors.surfaceMuted : colors.surfaceMuted,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/post/${item.id}` as never)}
              className="rounded-2xl overflow-hidden bg-surface-muted-light dark:bg-surface-muted-dark"
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
                    backgroundColor: colors.surface,
                  }}
                  className="items-center justify-center px-3"
                >
                  <Text
                    className="text-[16px] leading-[23px]"
                    numberOfLines={4}
                    style={{ color: colors.textPrimary }}
                  >
                    {item.contentText || "This post has no content"}
                  </Text>
                </View>
              )}

              <View className="px-3 py-2.5">
                <View className="flex-row items-center mb-1">
                  <Avatar
                    source={
                      item.user?.avatar ? { uri: item.user.avatar } : undefined
                    }
                    fallback={item.user?.name}
                    size="sm"
                  />

                  <Text
                    className="ml-2 flex-1 text-base font-semibold text-text-light dark:text-text-dark"
                    numberOfLines={1}
                  >
                    {item.user?.name || "User"}
                  </Text>
                </View>

                <Text variant="default" className="text-xs mt-2">
                  {item.likesCount} likes · {item.commentsCount} comments
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
