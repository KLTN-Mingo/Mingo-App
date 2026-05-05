import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/shared/ui/EmptyState";

/**
 * Tin nhắn — tab cuối; thay bằng danh sách chat khi có API.
 */
export default function MessageScreen() {
  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      edges={["top"]}
    >
      <EmptyState title="No conversations yet" />
    </SafeAreaView>
  );
}
