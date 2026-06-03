import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { PostCard } from "@/components/post/PostCard";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { Avatar, Text } from "@/components/ui";
import { paletteIcon } from "@/constants/designTokens";
import type {
  PostResponseDto,
  RepostItemDto,
  UserMinimalDto,
} from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useShareEvents } from "@/hooks/use-share-events";
import { useSharePost } from "@/hooks/use-share-post";
import { shareService } from "@/services/share.service";

interface ProfileRepostsListProps {
  /** Chủ profile đang xem — list reposts của user này. */
  userId: string;
  /** User đang đăng nhập — để PostCard biết save/like state. */
  currentUser?: UserMinimalDto | null;
}

const PAGE_LIMIT = 20;
/** Cap chống vòng lặp BE trả `hasMore` sai. */
const MAX_PAGES = 50;

export function ProfileRepostsList({
  userId,
  currentUser,
}: ProfileRepostsListProps) {
  const colorScheme = useColorScheme() ?? "light";
  const iconColor =
    colorScheme === "dark" ? paletteIcon.dark : paletteIcon.light;

  const [items, setItems] = useState<RepostItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  const share = useSharePost({ currentUserId: currentUser?.id });

  const fetchAll = useCallback(async () => {
    const out: RepostItemDto[] = [];
    let page = 1;
    while (page <= MAX_PAGES) {
      const r = await shareService.getUserReposts(userId, page, PAGE_LIMIT);
      out.push(...r.reposts);
      if (!r.pagination.hasMore || r.reposts.length === 0) break;
      page += 1;
    }
    return out;
  }, [userId]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchAll();
      setItems(all);
    } catch (e) {
      console.error("[profile] reposts fetch failed", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Realtime: khi user đang xem profile của chính mình & có người repost bài
  // mình, hoặc chủ profile đăng repost mới → reload.
  useShareEvents(reload, { type: "repost" });

  if (loading) {
    return (
      <View className="py-6 items-center">
        <ActivityIndicator color={iconColor} />
      </View>
    );
  }

  if (items.length === 0) {
    return <EmptyState title="Chưa có repost nào" />;
  }

  return (
    <View className="flex-1 gap-4">
      {items.map((it) => (
        <RepostEntry
          key={it.repostId}
          repost={it}
          currentUser={currentUser}
          onSharePress={share.openSheet}
          onUserPress={(uid) => router.push(`/profile/${uid}` as never)}
        />
      ))}
      {share.modals}
    </View>
  );
}

interface RepostEntryProps {
  repost: RepostItemDto;
  currentUser?: UserMinimalDto | null;
  onSharePress: (post: PostResponseDto) => void;
  onUserPress: (userId: string) => void;
}

function RepostEntry({
  repost,
  currentUser,
  onSharePress,
  onUserPress,
}: RepostEntryProps) {
  return (
    <View className="gap-2">
      {/* Comment quote nếu có (quote repost) */}
      {repost.comment ? (
        <View className="flex-row items-start gap-2 px-1">
          <Avatar
            source={
              repost.post.user?.avatar
                ? { uri: repost.post.user.avatar }
                : undefined
            }
            fallback={repost.post.user?.name}
            size="sm"
          />
          <View className="flex-1 rounded-lg bg-surface-light dark:bg-surface-dark px-3 py-2">
            <Text
              className="text-sm text-text-light dark:text-text-dark"
              numberOfLines={4}
            >
              {repost.comment}
            </Text>
          </View>
        </View>
      ) : null}

      <PostCard
        post={repost.post}
        currentUser={currentUser}
        onSharePress={onSharePress}
        onUserPress={onUserPress}
      />
    </View>
  );
}
