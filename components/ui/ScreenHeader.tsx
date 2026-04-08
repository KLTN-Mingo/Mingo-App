import { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "./Text";

interface ScreenHeaderProps {
  title: string;
  /** Nút back hoặc custom bên trái */
  leftSlot?: ReactNode;
  /** Search, add friend, v.v. */
  rightSlot?: ReactNode;
  className?: string;
}

/**
 * Header màn hình theo mockup: tiêu đề trái, action phải, nền theo theme.
 */
export function ScreenHeader({
  title,
  leftSlot,
  rightSlot,
  className = "",
}: ScreenHeaderProps) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3 bg-background-light dark:bg-background-dark ${className}`}
    >
      <View className="flex-row items-center flex-1 min-w-0 gap-2">
        {leftSlot}
        <Text
          variant="subtitle"
          className="text-text-light dark:text-text-dark flex-shrink"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      {rightSlot ? (
        <View className="flex-row items-center gap-3 flex-shrink-0">
          {rightSlot}
        </View>
      ) : null}
    </View>
  );
}
