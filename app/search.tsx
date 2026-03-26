import { router } from "expo-router";
import { TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ArrowIcon,
  SearchIcon,
} from "@/components/shared/icons/Icons";
import { Text } from "@/components/ui";
import { useTheme } from "@/context/ThemeContext";
import { getSemantic } from "@/constants/designTokens";

export default function SearchScreen() {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");

  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      edges={["top"]}
    >
      <View className="flex-row items-center px-3 py-2 border-b border-border-light dark:border-border-dark">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowIcon size={22} color={sem.text} />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center px-3 py-2 rounded-full bg-input-light dark:bg-input-dark">
          <SearchIcon size={20} color={sem.textMuted} />
          <TextInput
            className="flex-1 ml-2 font-regular text-base text-text-light dark:text-text-dark py-0"
            placeholder="Tìm kiếm..."
            placeholderTextColor={sem.placeholder}
            autoFocus
          />
        </View>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Text variant="muted" className="text-center">
          Nhập từ khóa để tìm bài viết, người dùng hoặc địa điểm.
        </Text>
      </View>
    </SafeAreaView>
  );
}
