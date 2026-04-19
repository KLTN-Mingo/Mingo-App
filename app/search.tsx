import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArrowIcon } from "@/components/shared/icons/Icons";
import { SearchBarInput } from "@/components/shared/ui/search-bar";
import { Avatar, Text } from "@/components/ui";
import { getSemantic } from "@/constants/designTokens";
import { PublicUserDto } from "@/dtos";
import { useTheme } from "@/context/ThemeContext";
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
      const msg = e instanceof Error ? e.message : "Không tìm được";
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
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      edges={["top"]}
    >
      <View className="flex-row items-center px-3 py-2 border-b border-border-light dark:border-border-dark">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowIcon size={22} color={sem.text} />
        </TouchableOpacity>
        <SearchBarInput
          placeholder="Tìm người dùng (tên)..."
          value={query}
          onChangeText={setQuery}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {loading && (
        <View className="py-4 items-center">
          <ActivityIndicator color={sem.primary} />
        </View>
      )}

      {error && !loading && (
        <Text variant="muted" className="px-4 py-2 text-center">
          {error}
        </Text>
      )}

      {!debounced && !loading && (
        <View className="flex-1 items-center justify-center px-6">
          <Text variant="muted" className="text-center">
            Nhập tên hoặc từ khóa để tìm người dùng (API{" "}
            <Text className="font-mono text-xs">GET /users?search=</Text>).
          </Text>
        </View>
      )}

      {debounced && !loading && users.length === 0 && !error && (
        <View className="flex-1 items-center justify-center px-6">
          <Text variant="muted">Không có kết quả.</Text>
        </View>
      )}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/profile/${item.id}` as any)}
            className="flex-row items-center px-4 py-3 border-b border-border-light dark:border-border-dark"
          >
            <Avatar
              source={item.avatar ? { uri: item.avatar } : undefined}
              fallback={item.name}
              size="md"
            />
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-text-light dark:text-text-dark">
                {item.name || "Người dùng"}
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
    </SafeAreaView>
  );
}
