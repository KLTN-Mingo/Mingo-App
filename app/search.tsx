import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ArrowIcon,
  CancelIcon,
} from "@/components/shared/icons/Icons";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { SearchBarInput } from "@/components/shared/ui/search-bar";
import { Avatar, Icon, Text } from "@/components/ui";
import { paletteIcon } from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";
import type {
  SearchPostItemDto,
  SearchUserItemDto,
} from "@/dtos";
import {
  useSearchHistory,
  type SearchHistoryUser,
} from "@/hooks/use-search-history";
import { searchService } from "@/services/search.service";

/** BE yêu cầu q >= 2 ký tự */
const MIN_QUERY_LEN = 2;
/** Số item/lần fetch — BE giới hạn tối đa 20. */
const PAGE_LIMIT = 10;
type SearchTab = "users" | "posts";

interface PaginatedState<T> {
  items: T[];
  /** Page cuối cùng đã fetch thành công (0 = chưa load). */
  page: number;
  total: number;
  loadingMore: boolean;
}

function emptyPaginated<T>(): PaginatedState<T> {
  return { items: [], page: 0, total: 0, loadingMore: false };
}

export default function SearchScreen() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? paletteIcon.dark : paletteIcon.light;
  const mutedIconColor = isDark
    ? paletteIcon.darkMuted
    : paletteIcon.lightMuted;

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("users");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usersState, setUsersState] = useState<
    PaginatedState<SearchUserItemDto>
  >(() => emptyPaginated<SearchUserItemDto>());
  const [postsState, setPostsState] = useState<
    PaginatedState<SearchPostItemDto>
  >(() => emptyPaginated<SearchPostItemDto>());

  const history = useSearchHistory();

  const runSearch = useCallback(async () => {
    const q = query.trim();
    if (q.length < MIN_QUERY_LEN) {
      setSubmittedQuery("");
      setError("Từ khóa tìm kiếm phải có ít nhất 2 ký tự");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await searchService.globalSearch({
        q,
        page: 1,
        limit: PAGE_LIMIT,
        type: "all",
      });
      setSubmittedQuery(q);
      setUsersState({
        items: res.users,
        page: 1,
        total: res.pagination.usersTotal,
        loadingMore: false,
      });
      setPostsState({
        items: res.posts,
        page: 1,
        total: res.pagination.postsTotal,
        loadingMore: false,
      });
      setActiveTab("users");
    } catch (e) {
      console.error("[search] global failed", e);
      const msg = e instanceof Error ? e.message : "Không tải được kết quả";
      setError(msg);
      setSubmittedQuery(q);
      setUsersState(emptyPaginated<SearchUserItemDto>());
      setPostsState(emptyPaginated<SearchPostItemDto>());
    } finally {
      setLoading(false);
    }
  }, [query]);

  const loadMoreUsers = useCallback(async () => {
    if (!submittedQuery) return;
    if (usersState.loadingMore) return;
    if (usersState.page === 0) return;
    if (usersState.items.length >= usersState.total) return;

    setUsersState((s) => ({ ...s, loadingMore: true }));
    try {
      const r = await searchService.searchUsers(
        submittedQuery,
        usersState.page + 1,
        PAGE_LIMIT
      );
      setUsersState((s) => {
        const seen = new Set(s.items.map((u) => u.id));
        const fresh = r.users.filter((u) => !seen.has(u.id));
        return {
          items: [...s.items, ...fresh],
          page: s.page + 1,
          total: r.total || s.total,
          loadingMore: false,
        };
      });
    } catch (e) {
      console.error("[search] load more users failed", e);
      setUsersState((s) => ({ ...s, loadingMore: false }));
    }
  }, [
    submittedQuery,
    usersState.loadingMore,
    usersState.items.length,
    usersState.total,
    usersState.page,
  ]);

  const loadMorePosts = useCallback(async () => {
    if (!submittedQuery) return;
    if (postsState.loadingMore) return;
    if (postsState.page === 0) return;
    if (postsState.items.length >= postsState.total) return;

    setPostsState((s) => ({ ...s, loadingMore: true }));
    try {
      const r = await searchService.searchPosts(
        submittedQuery,
        postsState.page + 1,
        PAGE_LIMIT
      );
      setPostsState((s) => {
        const seen = new Set(s.items.map((p) => p.id));
        const fresh = r.posts.filter((p) => !seen.has(p.id));
        return {
          items: [...s.items, ...fresh],
          page: s.page + 1,
          total: r.total || s.total,
          loadingMore: false,
        };
      });
    } catch (e) {
      console.error("[search] load more posts failed", e);
      setPostsState((s) => ({ ...s, loadingMore: false }));
    }
  }, [
    submittedQuery,
    postsState.loadingMore,
    postsState.items.length,
    postsState.total,
    postsState.page,
  ]);

  const handlePickUser = useCallback(
    async (u: { id: string; name?: string; avatar?: string }) => {
      await history.add({ id: u.id, name: u.name, avatar: u.avatar });
      router.push(`/profile/${u.id}` as never);
    },
    [history]
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed !== submittedQuery) {
      setUsersState(emptyPaginated<SearchUserItemDto>());
      setPostsState(emptyPaginated<SearchPostItemDto>());
      setError(null);
      setSubmittedQuery("");
    }
  }, [query, submittedQuery]);

  const localHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history.items;
    return history.items.filter((it) =>
      (it.name ?? "User").toLowerCase().includes(q)
    );
  }, [history.items, query]);

  const hasSubmittedResult = !!submittedQuery;
  const users = usersState.items;
  const posts = postsState.items;

  const showLocalHistory =
    !hasSubmittedResult && !loading && !error && localHistory.length > 0;
  const showLocalEmpty =
    !hasSubmittedResult &&
    !loading &&
    !error &&
    history.hydrated &&
    localHistory.length === 0;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header: nhập không gọi API; submit bằng keyboard Search hoặc nút search. */}
      <View className="flex-row items-center px-4 pt-3 pb-2 gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowIcon size={24} color={iconColor} />
        </TouchableOpacity>
        <SearchBarInput
          placeholder="Enter key"
          value={query}
          onChangeText={setQuery}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={runSearch}
        />
        <TouchableOpacity
          onPress={runSearch}
          accessibilityRole="button"
          accessibilityLabel="Tìm kiếm"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="w-10 h-10 rounded-full items-center justify-center bg-surface-light dark:bg-surface-dark"
        >
          <Icon name="magnifyingglass" size={20} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && (
        <View className="py-4 items-center">
          <ActivityIndicator color={iconColor} />
        </View>
      )}

      {/* Local history — filter trong AsyncStorage khi đang nhập. */}
      {showLocalHistory && (
        <View className="flex-row items-center justify-between px-4 mt-2 mb-1">
          <Text className="text-base font-semibold text-text-light dark:text-text-dark">
            Recently
          </Text>
          <TouchableOpacity
            onPress={history.clear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showLocalHistory && (
        <FlatList
          data={localHistory}
          keyExtractor={(it) => `recent-${it.id}`}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <RecentRow
              item={item}
              iconColor={mutedIconColor}
              onPress={() =>
                handlePickUser({ id: item.id, name: item.name, avatar: item.avatar })
              }
              onRemove={() => history.remove(item.id)}
            />
          )}
        />
      )}

      {showLocalEmpty && (
        <EmptyState title="Enter a name or keyword to search" />
      )}

      {error && !loading && (
        <View className="px-4 pt-4">
          <Text variant="muted" className="text-center">
            {error}
          </Text>
        </View>
      )}

      {hasSubmittedResult && !loading && !error && (
        <View className="flex-1">
          <SearchTabs activeTab={activeTab} onChange={setActiveTab} />
          {activeTab === "users" ? (
            <FlatList
              data={users}
              keyExtractor={(item) => `result-${item.id}`}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24, paddingTop: 14 }}
              onEndReachedThreshold={0.5}
              onEndReached={loadMoreUsers}
              ListEmptyComponent={
                <EmptyState title="Không tìm thấy người dùng phù hợp" />
              }
              ListFooterComponent={
                usersState.loadingMore ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator color={iconColor} />
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <UserResultCard
                  item={item}
                  iconColor={mutedIconColor}
                  onPress={() =>
                    handlePickUser({
                      id: item.id,
                      name: item.name,
                      avatar: item.avatar,
                    })
                  }
                />
              )}
            />
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(item) => `post-${item.id}`}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24, paddingTop: 14 }}
              onEndReachedThreshold={0.5}
              onEndReached={loadMorePosts}
              ListEmptyComponent={
                <EmptyState title="Không tìm thấy bài viết phù hợp" />
              }
              ListFooterComponent={
                postsState.loadingMore ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator color={iconColor} />
                  </View>
                ) : null
              }
              renderItem={({ item }) => <PostResultCard item={item} />}
            />
          )}
        </View>
      )}
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RecentRowProps {
  item: SearchHistoryUser;
  iconColor: string;
  onPress: () => void;
  onRemove: () => void;
}

function RecentRow({ item, iconColor, onPress, onRemove }: RecentRowProps) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <TouchableOpacity
        onPress={onPress}
        className="flex-1 flex-row items-center"
        activeOpacity={0.7}
      >
        <Avatar
          source={item.avatar ? { uri: item.avatar } : undefined}
          fallback={item.name}
          size="md"
        />
        <Text
          className="ml-3 flex-1 text-base text-text-light dark:text-text-dark"
          numberOfLines={1}
        >
          {item.name || "User"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        className="ml-2"
      >
        <CancelIcon size={18} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

interface UserResultRowProps {
  item: SearchUserItemDto;
  iconColor: string;
  onPress: () => void;
}

const UserResultCard = React.memo(function UserResultCard({
  item,
  iconColor,
  onPress,
}: UserResultRowProps) {
  const subtitle = useMemo(() => {
    if (item.followersCount > 0) return `${item.followersCount} mutual friends`;
    if (item.postsCount > 0) return `${item.postsCount} posts`;
    return item.bio;
  }, [item.bio, item.followersCount, item.postsCount]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mx-4 mb-3 rounded-lg bg-surface-light dark:bg-surface-dark px-4 py-3 flex-row items-center"
    >
      <Avatar
        source={item.avatar ? { uri: item.avatar } : undefined}
        fallback={item.name}
        size="md"
      />
      <View className="ml-3 flex-1">
        <Text
          className="text-base font-semibold text-text-light dark:text-text-dark"
          numberOfLines={1}
        >
          {item.name || "User"}
        </Text>
        {subtitle ? (
          <Text variant="muted" className="text-sm" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View className="w-9 h-9 rounded-full items-center justify-center bg-background-light dark:bg-background-dark">
        <Icon name="person.badge.plus" size={20} color={iconColor} />
      </View>
    </TouchableOpacity>
  );
});

interface SearchTabsProps {
  activeTab: SearchTab;
  onChange: (tab: SearchTab) => void;
}

function SearchTabs({ activeTab, onChange }: SearchTabsProps) {
  return (
    <View className="flex-row items-center gap-2 px-4 mt-3">
      <SearchTabButton
        label="Users"
        active={activeTab === "users"}
        onPress={() => onChange("users")}
      />
      <SearchTabButton
        label="Posts"
        active={activeTab === "posts"}
        onPress={() => onChange("posts")}
      />
    </View>
  );
}

interface SearchTabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function SearchTabButton({ label, active, onPress }: SearchTabButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`min-w-20 rounded-lg border px-6 py-2.5 ${
        active
          ? "bg-primary border-primary"
          : "bg-transparent border-border-light dark:border-border-dark"
      }`}
    >
      <Text
        className={`text-center text-sm font-medium ${
          active ? "text-white" : "text-text-light dark:text-text-dark"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface PostResultCardProps {
  item: SearchPostItemDto;
}

function PostResultCard({ item }: PostResultCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => router.push(`/post/${item.id}` as never)}
      className="mx-4 mb-3 rounded-lg bg-surface-light dark:bg-surface-dark px-4 py-3"
    >
      <View className="flex-row items-center mb-2">
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
      <Text
        className="text-sm text-text-light dark:text-text-dark"
        numberOfLines={2}
      >
        {item.contentText || "Bài viết không có nội dung"}
      </Text>
      <Text variant="muted" className="mt-2 text-xs">
        {item.likesCount} likes · {item.commentsCount} comments
      </Text>
    </TouchableOpacity>
  );
}
