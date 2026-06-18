import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/containers/ScreenContainer";
import { PostCard } from "@/components/post/PostCard";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { BackHeader, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  PaginationDto,
  PostResponseDto,
  UserMinimalDto,
} from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSharePost } from "@/hooks/use-share-post";
import { postService } from "@/services/post.service";
import { paletteIcon } from "@/styles/colors";

const PAGE_LIMIT = 20;

export default function HashtagPostsScreen() {
  const { tag: rawTag } = useLocalSearchParams<{ tag: string }>();
  const tag = decodeURIComponent(rawTag ?? "").replace(/^#/, "");
  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const iconColor = paletteIcon[colorScheme];

  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser: UserMinimalDto | null = profile
    ? {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        verified: profile.verified,
      }
    : null;

  const fetchPosts = useCallback(
    async (page = 1, append = false) => {
      if (!tag) return;
      try {
        if (!append) setError(null);
        const data = await postService.getPostsByHashtag(
          tag,
          page,
          PAGE_LIMIT
        );
        if (append) setPosts((prev) => [...prev, ...data.posts]);
        else setPosts(data.posts);
        setPagination(data.pagination);
      } catch (e) {
        console.error("[hashtag] load failed", e);
        if (!append) setError("Could not load post");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [tag]
  );

  useEffect(() => {
    setLoading(true);
    fetchPosts(1, false);
  }, [fetchPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts(1, false);
  };

  const onLoadMore = () => {
    if (loadingMore || !pagination?.hasMore) return;
    setLoadingMore(true);
    fetchPosts(pagination.page + 1, true);
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

  return (
    <ScreenContainer horizontalPadding="none">
      <BackHeader className="px-4 pt-3 pb-2">
        <View>
          <Text
            className="text-lg font-semibold text-text-light dark:text-text-dark"
            numberOfLines={1}
          >
            #{tag}
          </Text>
          {pagination?.total ? (
            <Text variant="muted" className="text-xs">
              {pagination.total} posts
            </Text>
          ) : null}
        </View>
      </BackHeader>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={iconColor} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text variant="muted" className="text-center">
            {error}
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingBottom: 32,
            paddingTop: 8,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={iconColor}
              colors={[iconColor]}
            />
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUser={currentUser}
              onUserPress={(id) => router.push(`/profile/${id}` as never)}
              onCommentPress={(id) => router.push(`/post/${id}` as never)}
              onSharePress={share.openSheet}
            />
          )}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <EmptyState title="No posts yet for this hashtag" />
          }
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator color={iconColor} />
              </View>
            ) : null
          }
        />
      )}

      {share.modals}
    </ScreenContainer>
  );
}
