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
  userId: string;
  profileUser?: UserMinimalDto | null;
  currentUser?: UserMinimalDto | null;
}

const PAGE_LIMIT = 20;
const MAX_PAGES = 50;

export function ProfileRepostsList({
  userId,
  profileUser,
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

  useShareEvents(reload, { type: "repost" });

  if (loading) {
    return (
      <View className="py-6 items-center">
        <ActivityIndicator color={iconColor} />
      </View>
    );
  }

  if (items.length === 0) {
    return <EmptyState title="No reposts yet" />;
  }

  return (
    <View className="flex-1 gap-4">
      {items.map((it) => (
        <RepostEntry
          key={it.repostId}
          repost={it}
          profileUser={profileUser}
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
  profileUser?: UserMinimalDto | null;
  currentUser?: UserMinimalDto | null;
  onSharePress: (post: PostResponseDto) => void;
  onUserPress: (userId: string) => void;
}

function RepostEntry({
  repost,
  profileUser,
  currentUser,
  onSharePress,
  onUserPress,
}: RepostEntryProps) {
  const repostUser = profileUser ?? {
    id: repost.authorId,
    name: "User",
    avatar: undefined,
    verified: false,
  };

  return (
    <View className="relative pl-5">
      <View className="absolute bottom-2 left-2 top-5 w-px bg-border-light dark:bg-border-dark" />

      <View className="mb-2 flex-row items-start gap-3">
        <View className="mt-2 h-2 w-2 rounded-full bg-primary" />
        <View className="flex-1 min-w-0">
          <Text className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
            {repostUser.name || "User"} reposted
          </Text>
          {repost.comment ? (
            <View className="mt-1 rounded-lg bg-surface-light dark:bg-surface-dark px-3 py-2">
              <Text
                className="text-sm text-text-light dark:text-text-dark"
                numberOfLines={4}
              >
                {repost.comment}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="ml-2">
          <Avatar
            source={repostUser.avatar ? { uri: repostUser.avatar } : undefined}
            fallback={repostUser.name}
            size="sm"
          />
        </View>
      </View>

      <PostCard
        post={repost.post}
        currentUser={currentUser}
        onSharePress={onSharePress}
        onUserPress={onUserPress}
      />
    </View>
  );
}
