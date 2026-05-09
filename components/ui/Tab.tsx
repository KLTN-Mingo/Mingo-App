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
 * Chip / tab ngang (Requests, Friends, …) theo Mingo design guide.
 * Active: #768D85 background | Inactive: transparent border
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
      className={`px-4 py-2 rounded-full ${isActive ? "bg-primary" : "bg-transparent border border-border-light dark:border-border-dark"} ${className}`}
    >
      <Text
        className={`font-medium text-sm ${isActive ? "text-white" : "text-text-secondary-light dark:text-text-secondary-dark"}`}
      >
        {content}
        {badge !== undefined && badge > 0 ? ` (${badge})` : ""}
      </Text>
    </TouchableOpacity>
  );
}
