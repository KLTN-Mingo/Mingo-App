import React, { RefObject } from "react";
import { ActivityIndicator, TextInput, TouchableOpacity, View } from "react-native";

import { ActionInput, Avatar, Text } from "@/components/ui";
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
      className="flex-row items-center gap-3 px-4 pb-1 pt-3"
      style={{ backgroundColor: colors.background }}
    >
      <Avatar
        source={avatarUri ? { uri: avatarUri } : undefined}
        fallback={avatarFallback}
        size="sm"
      />
      <View className="flex-1">
        <ActionInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          className="rounded-3xl px-4 py-3"
          style={{
            minHeight: 22,
            maxHeight: 96,
            fontSize: 13,
            lineHeight: 18,
            textAlignVertical: "center",
          }}
          multiline
          maxLength={500}
          returnKeyType="default"
          blurOnSubmit={false}
          rightIcon={
            canSend ? (
              <TouchableOpacity
                onPress={onSubmit}
                disabled={submitting}
                className="h-8 min-w-12 items-center justify-center px-1"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.textMuted} />
                ) : (
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: "#FF6B3D" }}
                  >
                    Send
                  </Text>
                )}
              </TouchableOpacity>
            ) : null
          }
        />
      </View>
    </View>
  );
}
