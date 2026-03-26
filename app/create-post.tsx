import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArrowIcon } from "@/components/shared/icons/Icons";
import { Text } from "@/components/ui";
import { useTheme } from "@/context/ThemeContext";
import { getSemantic } from "@/constants/designTokens";

export default function CreatePostScreen() {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");

  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      edges={["top"]}
    >
      <View className="flex-row items-center px-4 py-3 border-b border-border-light dark:border-border-dark">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2">
          <ArrowIcon size={22} color={sem.text} />
        </TouchableOpacity>
        <Text className="font-semibold text-lg text-text-light dark:text-text-dark flex-1">
          Tạo bài viết
        </Text>
        <TouchableOpacity className="px-3 py-1.5 rounded-lg bg-primary-100">
          <Text className="text-primary-foreground-light dark:text-primary-foreground-dark font-semibold text-sm">
            Đăng
          </Text>
        </TouchableOpacity>
      </View>
      <View className="flex-1 p-4">
        <Text variant="muted">
          Gắn form soạn bài (nội dung, ảnh, video) tại đây khi bạn sẵn sàng.
        </Text>
      </View>
    </SafeAreaView>
  );
}
