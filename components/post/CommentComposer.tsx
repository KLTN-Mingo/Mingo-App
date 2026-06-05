import React, { RefObject } from "react";
import {
  ActivityIndicator,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Avatar, Text } from "@/components/ui";
import type { paletteDark, paletteLight } from "@/constants/designTokens";

type Palette = typeof paletteLight | typeof paletteDark;

export interface CommentComposerProps {
  colors: Palette;
  avatarUri?: string | null;
  avatarFallback?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
  inputRef?: RefObject<TextInput | null>;
  placeholder?: string;
}

/** Ô nhập bình luận dạng pill — avatar trái, input bo tròn */
export function CommentComposer({
  colors,
  avatarUri,
  avatarFallback,
  value,
  onChangeText,
  onSubmit,
  submitting = false,
  inputRef,
  placeholder = "Write comment...",
}: CommentComposerProps) {
  const canSend = value.trim().length > 0;

  return (
    <View
      className="flex-row items-center px-4 py-3 gap-3"
      style={{
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <Avatar
        source={avatarUri ? { uri: avatarUri } : undefined}
        fallback={avatarFallback}
        size="sm"
      />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        className="flex-1 rounded-full px-4 text-sm font-regular"
        style={{
          backgroundColor: colors.surfaceMuted,
          color: colors.textPrimary,
          minHeight: 40,
          paddingVertical: Platform.OS === "ios" ? 10 : 8,
          textAlignVertical: "center",
        }}
        multiline
        maxLength={500}
        onSubmitEditing={onSubmit}
        returnKeyType="send"
        blurOnSubmit
      />
      {canSend ? (
        <TouchableOpacity
          onPress={onSubmit}
          disabled={submitting}
          className="px-2 py-1"
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.textMuted} />
          ) : (
            <Text className="text-sm font-semibold" style={{ color: "#FF6B3D" }}>
              Send
            </Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
