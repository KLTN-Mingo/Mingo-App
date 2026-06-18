import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/containers/ScreenContainer";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { Avatar, BackHeader, Button, Text } from "@/components/ui";
import { PaginatedBlockedUsersDto } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FollowApi } from "@/services/follow.service";
import { paletteIcon } from "@/styles/colors";

type BlockedUser = PaginatedBlockedUsersDto["blockedUsers"][number];

export default function BlockedUsersScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const iconColor = paletteIcon[colorScheme];
  const [items, setItems] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await FollowApi.getBlockedUsers(1, 50);
      setItems(data.blockedUsers ?? []);
    } catch (err) {
      console.error("[blocked-users] load failed", err);
      Alert.alert("Error", "Could not load the list");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleUnblock = (item: BlockedUser) => {
    Alert.alert(
      "Unblock this user?",
      `${item.user.name ?? "User"} will be able to view your profile and interact with you again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          style: "destructive",
          onPress: async () => {
            setUnblockingId(item.user.id);
            try {
              await FollowApi.unblockUser(item.user.id);
              setItems((prev) =>
                prev.filter((it) => it.user.id !== item.user.id)
              );
            } catch (err) {
              console.error("[blocked-users] unblock failed", err);
              Alert.alert("Error", "Could not unblock");
            } finally {
              setUnblockingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer horizontalPadding="none">
      <BackHeader title="Blocked users" className="px-4" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={iconColor} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.user.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={iconColor}
              colors={[iconColor]}
            />
          }
          contentContainerStyle={{ paddingVertical: 12 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          ListEmptyComponent={<EmptyState title="No blocked users yet" />}
          renderItem={({ item }) => (
            <View className="mx-4 px-4 py-3 rounded-xl bg-surface-light dark:bg-surface-dark flex-row items-center">
              <TouchableOpacity
                className="flex-row items-center flex-1"
                onPress={() =>
                  router.push(`/profile/${item.user.id}` as never)
                }
                activeOpacity={0.7}
              >
                <Avatar
                  source={item.user.avatar ? { uri: item.user.avatar } : undefined}
                  fallback={item.user.name}
                  size="md"
                />
                <View className="ml-3 flex-1">
                  <Text
                    className="text-base font-semibold text-text-light dark:text-text-dark"
                    numberOfLines={1}
                  >
                    {item.user.name || "User"}
                  </Text>
                  <Text variant="muted" className="text-xs">
                    Blocked{" "}
                    {new Date(item.blockedAt).toLocaleDateString("vi-VN")}
                  </Text>
                </View>
              </TouchableOpacity>
              <Button
                variant="outline"
                onPress={() => handleUnblock(item)}
                loading={unblockingId === item.user.id}
                className="ml-2"
              >
                Unblock
              </Button>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}
