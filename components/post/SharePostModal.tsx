import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";

import {
  CancelIcon,
  SearchIcon,
  SendIcon,
} from "@/components/shared/icons/Icons";
import { SearchBarInput } from "@/components/shared/ui/search-bar";
import { Avatar, Button, Text, TextArea } from "@/components/ui";
import { paletteIcon } from "@/constants/designTokens";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { FriendDto } from "@/dtos";
import { ShareApiError } from "@/dtos";
import { FollowApi } from "@/services/follow.service";
import { shareService } from "@/services/share.service";

interface SharePostModalProps {
  visible: boolean;
  postId: string | null;
  /** Callback khi share thành công — parent có thể bump `sharesCount`. */
  onShared?: (info: { postId: string; sentCount: number }) => void;
  onClose: () => void;
}

const MAX_RECIPIENTS = 10;
const MAX_MESSAGE_LEN = 2000;

export function SharePostModal({
  visible,
  postId,
  onShared,
  onClose,
}: SharePostModalProps) {
  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const iconColor =
    colorScheme === "dark" ? paletteIcon.dark : paletteIcon.light;
  const mutedIconColor = paletteIcon.lightMuted;

  const [friends, setFriends] = useState<FriendDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  // Reset state mỗi lần modal mở.
  useEffect(() => {
    if (!visible) return;
    setSearch("");
    setSelectedIds([]);
    setMessage("");
  }, [visible]);

  const loadFriends = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const r = await FollowApi.getFriends(profile.id, 1, 100);
      setFriends(r.friends);
    } catch (e) {
      console.error("[share-modal] load friends failed", e);
      Alert.alert("Lỗi", "Không tải được danh sách bạn bè");
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (visible) loadFriends();
  }, [visible, loadFriends]);

  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    // RECIPIENT_SELF_INVALID guard (guide §3) — luôn bỏ chính mình.
    const base = friends.filter((f) => f.user.id !== profile?.id);
    if (!q) return base;
    return base.filter((f) =>
      (f.user.name ?? "").toLowerCase().includes(q)
    );
  }, [friends, search, profile?.id]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_RECIPIENTS) {
        Alert.alert("Giới hạn", `Chỉ được chọn tối đa ${MAX_RECIPIENTS} người`);
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!postId) return;
    if (submitting) return;
    if (selectedIds.length === 0) {
      Alert.alert("Chưa chọn ai", "Vui lòng chọn ít nhất 1 người nhận");
      return;
    }

    setSubmitting(true);
    try {
      const r = await shareService.sendDMShare({
        postId,
        recipientIds: selectedIds,
        message: message.trim() || undefined,
      });
      onShared?.({ postId, sentCount: r.sentCount });
      onClose();
    } catch (e) {
      console.error("[share-modal] dm share failed", e);
      const err = e as ShareApiError;
      const code = err.code;
      // Theo bảng error trong guide §3.
      if (code === "RECIPIENTS_LIMIT_EXCEEDED") {
        Alert.alert("Quá giới hạn", err.message);
      } else if (code === "RECIPIENT_SELF_INVALID") {
        Alert.alert("Không hợp lệ", "Không thể gửi cho chính mình");
      } else if (code === "RECIPIENT_NOT_FRIEND") {
        Alert.alert(
          "Không phải bạn bè",
          "Chỉ có thể gửi cho những người là bạn của bạn"
        );
        loadFriends();
      } else if (code === "POST_NOT_FOUND") {
        Alert.alert("Bài viết không tồn tại", "Bài này có thể đã bị xoá");
        onClose();
      } else if (code === "SHARE_RATE_LIMIT_EXCEEDED") {
        Alert.alert(
          "Quá nhanh",
          "Bạn đã chia sẻ quá nhiều, vui lòng thử lại sau"
        );
      } else {
        Alert.alert("Lỗi", err?.message ?? "Không gửi được tin nhắn chia sẻ");
      }
    } finally {
      setSubmitting(false);
    }
  }, [postId, selectedIds, message, submitting, onShared, onClose, loadFriends]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="rounded-t-[20px] bg-background-light dark:bg-background-dark px-4 pt-4 pb-6 max-h-[85%]">
          {/* Header */}
          <View className="flex-row items-center mb-3">
            <Text className="flex-1 text-base font-semibold text-text-light dark:text-text-dark">
              Chia sẻ tới bạn bè
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CancelIcon size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="flex-row items-center mb-3">
            <SearchBarInput
              placeholder="Tìm bạn bè..."
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          {/* Friends list */}
          {loading ? (
            <View className="py-6 items-center">
              <ActivityIndicator color={iconColor} />
            </View>
          ) : (
            <FlatList
              data={filteredFriends}
              keyExtractor={(it) => it.user.id}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <SearchIcon size={28} color={mutedIconColor} />
                  <Text variant="muted" className="mt-2 text-sm text-center">
                    Không tìm thấy bạn bè phù hợp
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <FriendRow
                  user={item.user}
                  selected={selectedIds.includes(item.user.id)}
                  onToggle={() => toggle(item.user.id)}
                />
              )}
              style={{ maxHeight: 280 }}
            />
          )}

          {/* Message */}
          <View className="mt-3">
            <TextArea
              placeholder="Nhập tin nhắn (tuỳ chọn)..."
              value={message}
              onChangeText={setMessage}
              maxLength={MAX_MESSAGE_LEN}
            />
            <Text variant="muted" className="text-right text-xs mt-1">
              {message.length}/{MAX_MESSAGE_LEN}
            </Text>
          </View>

          {/* Submit */}
          <Button
            variant="primary"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting || selectedIds.length === 0}
            className="mt-3"
          >
            <View className="flex-row items-center gap-2">
              <SendIcon size={16} color="#FFFFFF" />
              <Text className="text-white font-semibold">
                {selectedIds.length > 0
                  ? `Gửi (${selectedIds.length})`
                  : "Gửi"}
              </Text>
            </View>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface FriendRowProps {
  user: FriendDto["user"];
  selected: boolean;
  onToggle: () => void;
}

function FriendRow({ user, selected, onToggle }: FriendRowProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.75}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      className="flex-row items-center px-1 py-2.5"
    >
      <Avatar
        source={user.avatar ? { uri: user.avatar } : undefined}
        fallback={user.name}
        size="md"
      />
      <Text
        className="ml-3 flex-1 text-base text-text-light dark:text-text-dark"
        numberOfLines={1}
      >
        {user.name || "User"}
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
}
