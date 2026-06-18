import React, { useEffect, useRef } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

import { Avatar, Text } from "@/components/ui";
import type { paletteDark, paletteLight } from "@/constants/designTokens";
import { CommentModerationStatus, CommentResponseDto } from "@/dtos";

type Palette = typeof paletteLight | typeof paletteDark;

export interface CommentThreadItemProps {
  comment: CommentResponseDto;
  colors: Palette;
  formatTime: (dateStr: string) => string;
  onLike: () => void;
  onReply: () => void;
  /** Tên người được trả lời — hiển thị `Author ▸ Name` */
  mentionName?: string;
  isEditing?: boolean;
  editDraft?: string;
  onEditDraftChange?: (text: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onDelete?: () => void;
  onPressComment?: () => void;
  showModerationStatus?: boolean;
}

function getModerationLabel(comment: CommentResponseDto): {
  label: string;
  backgroundColor: string;
  color: string;
} | null {
  if (
    comment.isHidden ||
    comment.moderationStatus === CommentModerationStatus.REJECTED
  ) {
    return {
      label: "Comment hidden for a violation",
      backgroundColor: "#FFEEEE",
      color: "#8A1C1C",
    };
  }

  if (comment.moderationStatus === CommentModerationStatus.PENDING) {
    return {
      label: "Pending review",
      backgroundColor: "#FFF7E0",
      color: "#7A5A0C",
    };
  }

  if (comment.moderationStatus === CommentModerationStatus.FLAGGED) {
    return {
      label: "Comment is under review",
      backgroundColor: "#FFF7E0",
      color: "#7A5A0C",
    };
  }

  return null;
}

/** Một dòng comment / reply — khớp mock: bubble xám, meta time · Like · Reply */
export function CommentThreadItem({
  comment,
  colors,
  formatTime,
  onLike,
  onReply,
  mentionName,
  isEditing = false,
  editDraft = "",
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onPressComment,
  showModerationStatus = false,
}: CommentThreadItemProps) {
  const authorName = comment.user?.name ?? "Unknown";
  const likeLabel =
    comment.likesCount > 0 ? `Like ${comment.likesCount}` : "Like";
  const moderation = showModerationStatus ? getModerationLabel(comment) : null;
  const editInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isEditing) return;

    const frame = requestAnimationFrame(() => {
      editInputRef.current?.focus();
    });
    const timer = setTimeout(() => {
      editInputRef.current?.focus();
    }, 80);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [isEditing]);

  return (
    <View className="flex-row px-4 py-2">
      <Avatar
        source={comment.user?.avatar ? { uri: comment.user.avatar } : undefined}
        fallback={comment.user?.name}
        size="sm"
      />
      <View className="ml-3 flex-1 min-w-0">
        <View className="flex-row items-center flex-wrap gap-1 mb-1">
          <Text
            className="font-semibold text-sm leading-tight"
            style={{ color: colors.textPrimary }}
          >
            {authorName}
          </Text>
          {mentionName ? (
            <>
              <Text
                className="text-sm leading-tight"
                style={{ color: colors.textMuted }}
              >
                ▸
              </Text>
              <Text
                className="font-semibold text-sm leading-tight"
                style={{ color: colors.textPrimary }}
              >
                {mentionName}
              </Text>
            </>
          ) : null}
        </View>

        {moderation ? (
          <View
            className="mb-1.5 self-start rounded-xl px-2.5 py-1.5"
            style={{ backgroundColor: moderation.backgroundColor }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: moderation.color }}
            >
              {moderation.label}
            </Text>
          </View>
        ) : null}

        {isEditing ? (
          <TextInput
            ref={editInputRef}
            value={editDraft}
            onChangeText={onEditDraftChange}
            className="text-sm rounded-2xl px-3 py-2.5 mb-1"
            style={{
              backgroundColor: colors.surfaceMuted,
              color: colors.textPrimary,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            multiline
            maxLength={500}
            autoFocus
            placeholderTextColor={colors.textMuted}
          />
        ) : (
          <TouchableOpacity
            onPress={onPressComment}
            disabled={!onPressComment}
            activeOpacity={0.75}
            className="rounded-2xl px-3.5 py-2.5 self-start max-w-full"
            style={{ backgroundColor: colors.surfaceMuted }}
          >
            <Text
              className="text-sm leading-relaxed"
              style={{ color: colors.textPrimary }}
            >
              {comment.contentText}
            </Text>
          </TouchableOpacity>
        )}

        {!isEditing ? (
          <View className="flex-row items-center flex-wrap gap-1.5 mt-1.5">
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {formatTime(comment.createdAt)}
            </Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              ·
            </Text>
            <TouchableOpacity onPress={onLike} activeOpacity={0.7}>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {likeLabel}
              </Text>
            </TouchableOpacity>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              ·
            </Text>
            <TouchableOpacity onPress={onReply} activeOpacity={0.7}>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Reply
              </Text>
            </TouchableOpacity>
            {onDelete ? (
              <>
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  ·
                </Text>
                <TouchableOpacity onPress={onDelete} activeOpacity={0.7}>
                  <Text className="text-xs" style={{ color: colors.danger }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        ) : (
          <View className="flex-row gap-4 mt-2 justify-end">
            <TouchableOpacity onPress={onSaveEdit}>
              <Text className="text-xs font-semibold text-primary-100">
                Save
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancelEdit}>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
