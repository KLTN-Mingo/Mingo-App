import { TouchableOpacity } from "react-native";
import { Text } from "./Text";

interface TabProps {
  content: string;
  isActive?: boolean;
  onClick?: () => void;
  badge?: number;
  className?: string;
}

/**
 * Chip / tab ngang (Requests, Friends, …) theo mockup dark & light.
 */
export function Tab({
  content,
  isActive = false,
  onClick,
  badge,
  className = "",
}: TabProps) {
  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.8}
      className={`px-4 py-2 rounded-full ${
        isActive
          ? "bg-primary-100"
          : "bg-surface-muted-light dark:bg-transparent border border-border-light dark:border-border-dark"
      } ${className}`}
    >
      <Text
        className={`font-medium text-base ${
          isActive
            ? "text-primary-foreground-light dark:text-primary-foreground-dark"
            : "text-text-light dark:text-text-dark"
        }`}
      >
        {content}
        {badge !== undefined && badge > 0 ? ` (${badge})` : ""}
      </Text>
    </TouchableOpacity>
  );
}
