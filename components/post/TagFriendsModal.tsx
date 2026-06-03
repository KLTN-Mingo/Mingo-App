import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
  View,
} from "react-native";

import { CancelIcon, SearchIcon } from "@/components/shared/icons/Icons";
import { SearchBarInput } from "@/components/shared/ui/search-bar";
import { Avatar, Button, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import type { FriendDto, UserMinimalDto } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FollowApi } from "@/services/follow.service";
import { paletteIcon } from "@/styles/colors";

interface TagFriendsModalProps {
  visible: boolean;
  initialSelected: UserMinimalDto[];
  maxSelected?: number;
  onClose: () => void;
  onConfirm: (users: UserMinimalDto[]) => void;
}

export function TagFriendsModal({
  visible,
  initialSelected,
  maxSelected = 20,
  onClose,
  onConfirm,
}: TagFriendsModalProps) {
  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const iconColor =
    colorScheme === "dark" ? paletteIcon.dark : paletteIcon.light;
  const mutedIconColor = paletteIcon.lightMuted;

  const [friends, setFriends] = useState<FriendDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible) return;
    setSearch("");
    setSelectedIds(new Set(initialSelected.map((u) => u.id)));
  }, [visible, initialSelected]);

  const loadFriends = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const r = await FollowApi.getFriends(profile.id, 1, 100);
      setFriends(r.friends);
    } catch (e) {
      console.error("[tag-friends] load friends failed", e);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (visible) loadFriends();
  }, [visible, loadFriends]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = friends.filter((f) => f.user.id !== profile?.id);
    if (!q) return base;
    return base.filter((f) => (f.user.name ?? "").toLowerCase().includes(q));
  }, [friends, search, profile?.id]);

  const toggle = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (next.size >= maxSelected) return prev;
          next.add(id);
        }
        return next;
      });
    },
    [maxSelected]
  );

  const handleConfirm = () => {
    const all = new Map<string, UserMinimalDto>();
    for (const f of friends) {
      all.set(f.user.id, {
        id: f.user.id,
        name: f.user.name,
        avatar: f.user.avatar,
        verified: f.user.verified,
      });
    }
    for (const u of initialSelected) {
      if (!all.has(u.id)) all.set(u.id, u);
    }
    const result = Array.from(selectedIds)
      .map((id) => all.get(id))
      .filter((x): x is UserMinimalDto => Boolean(x));
    onConfirm(result);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-[20px] bg-background-light dark:bg-background-dark px-4 pt-4 pb-6 max-h-[85%]">
          <View className="flex-row items-center mb-3">
            <Text className="flex-1 text-base font-semibold text-text-light dark:text-text-dark">
              Tag friends
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CancelIcon size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          <View className="mb-3">
            <SearchBarInput
              placeholder="Search friends..."
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          {loading ? (
            <View className="py-6 items-center">
              <ActivityIndicator color={iconColor} />
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(it) => it.user.id}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <SearchIcon size={28} color={mutedIconColor} />
                  <Text variant="muted" className="mt-2 text-sm text-center">
                    No friends match
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const selected = selectedIds.has(item.user.id);
                return (
                  <TouchableOpacity
                    onPress={() => toggle(item.user.id)}
                    activeOpacity={0.75}
                    className="flex-row items-center px-1 py-2.5"
                  >
                    <Avatar
                      source={
                        item.user.avatar ? { uri: item.user.avatar } : undefined
                      }
                      fallback={item.user.name}
                      size="md"
                    />
                    <Text
                      className="ml-3 flex-1 text-base text-text-light dark:text-text-dark"
                      numberOfLines={1}
                    >
                      {item.user.name || "User"}
                    </Text>
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center border ${
                        selected
                          ? "bg-primary border-primary"
                          : "border-border-light dark:border-border-dark"
                      }`}
                    >
                      {selected ? (
                        <Text className="text-white text-xs font-bold">✓</Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 320 }}
            />
          )}

          <Button onPress={handleConfirm} className="mt-3">
            <Text className="text-white font-semibold">
              {selectedIds.size > 0 ? `Done (${selectedIds.size})` : "Done"}
            </Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}
