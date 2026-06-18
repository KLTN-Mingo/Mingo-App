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
import { getSemantic, paletteIcon } from "@/styles/colors";

/** Nền thanh tìm — theo Mingo design guide */
export const SEARCH_BAR_SURFACE_CLASS =
  "bg-surface-muted-light dark:bg-surface-muted-dark";

export type SearchBarTriggerProps = {
  onPress: () => void;
  placeholder?: string;
  className?: string;
};

/** Ô tìm kiếm dạng nút (vd. Home → mở màn search) */
export function SearchBarTrigger({
  onPress,
  placeholder = "Search posts, users...",
  className = "",
}: SearchBarTriggerProps) {
  const colorScheme = useColorScheme() ?? "light";
  const iconColor = paletteIcon[colorScheme];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`flex-row items-center mt-1 px-4 rounded-full h-[44px] ${SEARCH_BAR_SURFACE_CLASS} ${className}`}
    >
      <Text
        variant="muted"
        className="flex-1 text-sm text-text-muted-light dark:text-text-muted-dark"
      >
        {placeholder}
      </Text>
      <SearchIcon size={20} color={iconColor} />
    </TouchableOpacity>
  );
}

export type SearchBarInputProps = TextInputProps & {
  /** className thêm vào wrapper (icon + field) */
  containerClassName?: string;
  /** Phần tử hành động ở mép phải của thanh tìm kiếm */
  rightElement?: React.ReactNode;
};

/** Thanh tìm có icon + TextInput (vd. màn Search) */
export function SearchBarInput({
  containerClassName = "",
  className = "",
  rightElement,
  style,
  ...inputProps
}: SearchBarInputProps) {
  const colorScheme = useColorScheme() ?? "light";
  const sem = getSemantic(colorScheme);
  const iconColor = paletteIcon[colorScheme];

  return (
    <View
      className={`w-full flex-row items-center px-4 rounded-full h-[44px] ${SEARCH_BAR_SURFACE_CLASS} ${containerClassName}`}
    >
      <SearchIcon size={20} color={iconColor} />

      <TextInput
        className={`flex-1 ml-2 font-regular text-base text-text-light dark:text-text-dark py-0 ${className}`}
        placeholderTextColor={sem.placeholder}
        style={[
          {
            height: 22,
            lineHeight: 20,
            paddingTop: 0,
            paddingBottom: 0,
            textAlignVertical: "center",
            includeFontPadding: false,
          },
          style,
        ]}
        {...inputProps}
      />

      {rightElement}
    </View>
  );
}
