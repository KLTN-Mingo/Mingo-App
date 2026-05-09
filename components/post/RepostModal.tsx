import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";

import { CancelIcon } from "@/components/shared/icons/Icons";
import { Avatar, Button, Text, TextArea } from "@/components/ui";
import { paletteIcon } from "@/constants/designTokens";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { PostResponseDto, RepostSuccessDto } from "@/dtos";
import { ShareApiError } from "@/dtos";
import { shareService } from "@/services/share.service";

interface RepostModalProps {
  visible: boolean;
  post: PostResponseDto | null;
  onClose: () => void;
  /** Báo parent đã repost xong để cập nhật repostCount / state cục bộ. */
  onReposted?: (info: RepostSuccessDto) => void;
}

const MAX_COMMENT_LEN = 2000;

export function RepostModal({
  visible,
  post,
  onClose,
  onReposted,
}: RepostModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const iconColor =
    colorScheme === "dark" ? paletteIcon.dark : paletteIcon.light;

  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) setComment("");
  }, [visible]);

  const handleSubmit = async () => {
    if (!post || submitting) return;
    setSubmitting(true);
    try {
      const r = await shareService.repost({
        postId: post.id,
        comment: comment.trim() || undefined,
      });
      onReposted?.(r);
      onClose();
    } catch (e) {
      console.error("[repost-modal] failed", e);
      const err = e as ShareApiError;
      const code = err.code;
      // Theo bảng error trong guide §3.
      if (code === "REPOST_DUPLICATED") {
        Alert.alert("Đã repost rồi", "Bạn đã repost bài viết này trước đó");
        // Treat as success (state-wise) — đóng modal.
        onClose();
      } else if (code === "REPOST_OWN_POST_FORBIDDEN") {
        Alert.alert(
          "Không thể repost",
          "Bạn không thể repost bài của chính mình"
        );
        onClose();
      } else if (code === "POST_NOT_FOUND") {
        Alert.alert("Bài viết không tồn tại", "Bài này có thể đã bị xoá");
        onClose();
      } else if (code === "SHARE_RATE_LIMIT_EXCEEDED") {
        Alert.alert(
          "Quá nhanh",
          "Bạn đã chia sẻ quá nhiều, vui lòng thử lại sau"
        );
      } else {
        Alert.alert("Lỗi", err?.message ?? "Không repost được bài viết");
      }
    } finally {
      setSubmitting(false);
    }
  };

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
        <View className="rounded-t-[20px] bg-background-light dark:bg-background-dark px-4 pt-4 pb-6">
          <View className="flex-row items-center mb-3">
            <Text className="flex-1 text-base font-semibold text-text-light dark:text-text-dark">
              Repost bài viết
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={submitting}
            >
              <CancelIcon size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Quote preview */}
          {post && (
            <View className="mb-3 rounded-lg p-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
              <View className="flex-row items-center mb-2">
                <Avatar
                  source={post.user?.avatar ? { uri: post.user.avatar } : undefined}
                  fallback={post.user?.name}
                  size="sm"
                />
                <Text className="ml-2 text-sm font-semibold text-text-light dark:text-text-dark" numberOfLines={1}>
                  {post.user?.name || "User"}
                </Text>
              </View>
              {post.contentText ? (
                <Text className="text-sm text-text-light dark:text-text-dark" numberOfLines={3}>
                  {post.contentText}
                </Text>
              ) : null}
            </View>
          )}

          <TextArea
            placeholder="Thêm nhận xét của bạn (tuỳ chọn)..."
            value={comment}
            onChangeText={setComment}
            maxLength={MAX_COMMENT_LEN}
          />
          <Text variant="muted" className="text-right text-xs mt-1">
            {comment.length}/{MAX_COMMENT_LEN}
          </Text>

          <Button
            variant="primary"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            className="mt-3"
          >
            Repost
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
