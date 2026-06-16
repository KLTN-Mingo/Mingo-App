import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeModalSheet } from "@/components/containers/SafeLayout";
import { CancelIcon } from "@/components/shared/icons/Icons";
import { Avatar, Button, Text, TextArea } from "@/components/ui";
import { paletteIcon } from "@/constants/designTokens";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { PostResponseDto, RepostSuccessDto } from "@/dtos";
import { ShareApiError } from "@/dtos";
import { FollowApi } from "@/services/follow.service";
import {
  frontendCacheKeys,
  invalidateCacheKeys,
} from "@/services/frontend-cache";
import { isPostPermissionDeniedError } from "@/services/post-permission";
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
      if (isPostPermissionDeniedError(e)) {
        invalidateCacheKeys([
          frontendCacheKeys.postDetail(post.id),
          frontendCacheKeys.feedPosts,
          frontendCacheKeys.savedPosts,
          frontendCacheKeys.relationship(post.userId),
          frontendCacheKeys.followStats(post.userId),
          frontendCacheKeys.userPosts(post.userId),
        ]);
        try {
          await FollowApi.getRelationshipStatus(post.userId);
        } catch {
          // best-effort refresh
        }
        Alert.alert(
          "No longer available",
          "You no longer have access to this post."
        );
        onClose();
        return;
      }
      const err = e as ShareApiError;
      const code = err.code;
      // Theo bảng error trong guide §3.
      if (code === "REPOST_DUPLICATED") {
        Alert.alert("Already reposted", "You have already reposted this post");
        // Treat as success (state-wise) — đóng modal.
        onClose();
      } else if (code === "REPOST_OWN_POST_FORBIDDEN") {
        Alert.alert(
          "Cannot repost",
          "You cannot repost your own post"
        );
        onClose();
      } else if (code === "POST_NOT_FOUND") {
        Alert.alert("Post not found", "This post may have been deleted");
        onClose();
      } else if (code === "SHARE_RATE_LIMIT_EXCEEDED") {
        Alert.alert(
          "Too fast",
          "You have shared too much. Please try again later"
        );
      } else {
        Alert.alert("Error", err?.message ?? "Could not repost post");
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
        <SafeModalSheet>
          <View className="flex-row items-center mb-3">
            <Text className="flex-1 text-base font-semibold text-text-light dark:text-text-dark">
              Repost posts
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
            placeholder="Add a comment (optional)..."
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
        </SafeModalSheet>
      </KeyboardAvoidingView>
    </Modal>
  );
}
