import React from "react";
import {
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

import { SearchIcon } from "@/components/shared/icons/Icons";
import { Text } from "@/components/ui";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getSemantic } from "@/styles/colors";

/** Nền thanh tìm — khớp `Button` variant outline / token `component` */
export const SEARCH_BAR_SURFACE_CLASS =
  "bg-component-light dark:bg-component-dark";

export type SearchBarTriggerProps = {
  onPress: () => void;
  placeholder?: string;
  className?: string;
};

/** Ô tìm kiếm dạng nút (vd. Home → mở màn search) */
export function SearchBarTrigger({
  onPress,
  placeholder = "Tìm kiếm bài viết, người dùng...",
  className = "",
}: SearchBarTriggerProps) {
  const colorScheme = useColorScheme() ?? "light";
  const semantic = getSemantic(colorScheme);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`flex-row items-center mt-1 px-4 py-3 rounded-[20px] ${SEARCH_BAR_SURFACE_CLASS} ${className}`}
    >
      <Text
        variant="muted"
        className="flex-1 text-[16px] h-[20px] text-text-muted-light dark:text-text-muted-dark"
      >
        {placeholder}
      </Text>
      <SearchIcon size={22} color={semantic.textMuted} />
    </TouchableOpacity>
  );
}

export type SearchBarInputProps = TextInputProps & {
  /** className thêm vào wrapper (icon + field) */
  containerClassName?: string;
};

/** Thanh tìm có icon + TextInput (vd. màn Search) */
export function SearchBarInput({
  containerClassName = "",
  className = "",
  ...inputProps
}: SearchBarInputProps) {
  const colorScheme = useColorScheme() ?? "light";
  const sem = getSemantic(colorScheme);
  return (
    <View
      className={`flex-1 flex-row items-center px-3 py-2 rounded-full ${SEARCH_BAR_SURFACE_CLASS} ${containerClassName}`}
    >
      <SearchIcon size={20} color={sem.textMuted} />
      <TextInput
        className={`flex-1 ml-2 font-regular text-base text-text-light dark:text-text-dark py-0 ${className}`}
        placeholderTextColor={sem.placeholder}
        {...inputProps}
      />
    </View>
  );
}
