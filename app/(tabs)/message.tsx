import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MessageIcon } from "@/components/shared/icons/Icons";
import { Text } from "@/components/ui";

/**
 * Tin nhắn — tab cuối; thay bằng danh sách chat khi có API.
 */
export default function MessageScreen() {
  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      edges={["top"]}
    >
      <View className="flex-1 items-center justify-center px-6">
        <MessageIcon size={56} color="#768D85" />
        <Text className="mt-4 text-center text-text-light dark:text-text-dark font-semibold text-lg">
          Tin nhắn
        </Text>
        <Text variant="muted" className="mt-2 text-center">
          Cuộc trò chuyện của bạn sẽ hiển thị tại đây.
        </Text>
      </View>
    </SafeAreaView>
  );
}
