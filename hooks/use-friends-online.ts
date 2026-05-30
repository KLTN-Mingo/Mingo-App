import { FriendOnlineItem, messageService } from "@/services/message.service";
import { useCallback, useEffect, useState } from "react";

export function useFriendsOnline() {
  const [friends, setFriends] = useState<FriendOnlineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await messageService.getFriendsWithOnlineStatus();
      // Online friends trước, offline sau
      const sorted = [...data].sort((a, b) =>
        a.onlineStatus === b.onlineStatus ? 0 : a.onlineStatus ? -1 : 1
      );
      setFriends(sorted);
    } catch (err) {
      console.error("useFriendsOnline error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    // Refresh mỗi 30s để cập nhật online status
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { friends, isLoading, refetch: fetch };
}
