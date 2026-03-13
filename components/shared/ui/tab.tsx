import React from "react";
import { TouchableOpacity, Text, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "@/context/ThemeContext"; // Nếu bạn có quản lý theme
import { colors } from "@/styles/colors"; // File màu bạn import ở các file khác

interface TabProps {
  content: string;
  isActive?: boolean;
  onClick?: () => void;
}

const Tab: React.FC<TabProps> = ({ content, isActive, onClick }) => {
  const { colorScheme } = useTheme();

  const activeBackgroundColor = colors.primary[100];
  const inactiveBackgroundColor =
    colorScheme === "dark" ? colors.dark[400] : colors.light[400];

  const activeTextColor =
    colorScheme === "dark" ? colors.dark[100] : colors.light[500];
  const inactiveTextColor =
    colorScheme === "dark" ? colors.dark[300] : colors.light[300];

  return (
    <TouchableOpacity
      onPress={onClick}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: isActive
          ? activeBackgroundColor
          : inactiveBackgroundColor,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-start",
      }}
      activeOpacity={0.7}
    >
      <Text
        style={{
          color: isActive ? activeTextColor : inactiveTextColor,
        }}
        className="font-mmedium text-4 rounded-3"
      >
        {content}
      </Text>
    </TouchableOpacity>
  );
};

export default Tab;
