import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/containers/ScreenContainer";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { SearchBarInput } from "@/components/shared/ui/search-bar";
import { Avatar, Text } from "@/components/ui";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSemantic } from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";
import { PublicUserDto } from "@/dtos";
import { userService } from "@/services/user.service";

const DEBOUNCE_MS = 400;

export default function SearchScreen() {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [users, setUsers] = useState<PublicUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const runSearch = useCallback(async (q: string) => {
    if (!q) {
      setUsers([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await userService.searchUsers(q, 1, 30);
      setUsers(res.users);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Search failed";
      setError(msg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(debounced);
  }, [debounced, runSearch]);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <PageHeader title="" showBackButton showBorder={false} />
      <ScreenContainer className="gap-4">
        <SearchBarInput
          placeholder="Search users..."
          value={query}
          onChangeText={setQuery}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
        />

        {loading && (
          <View className="py-4 items-center">
            <ActivityIndicator color={sem.primary} />
          </View>
        )}

        {error && !loading && (
          <Text variant="muted" className="text-center">
            {error}
          </Text>
        )}

        {!debounced && !loading && (
          <EmptyState title="Enter a name or keyword to search" />
        )}

        {debounced && !loading && users.length === 0 && !error && (
          <EmptyState title="No results found" />
        )}

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/profile/${item.id}` as any)}
              className="flex-row items-center py-3 border-b border-border-light dark:border-border-dark"
            >
              <Avatar
                source={item.avatar ? { uri: item.avatar } : undefined}
                fallback={item.name}
                size="md"
              />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-text-light dark:text-text-dark">
                  {item.name || "User"}
                </Text>
                {item.bio ? (
                  <Text variant="muted" className="text-sm" numberOfLines={1}>
                    {item.bio}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
        />
      </ScreenContainer>
    </View>
  );
}
