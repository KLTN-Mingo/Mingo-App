import { useCallback, useEffect, useRef } from "react";

import { useAuth } from "@/context/AuthContext";
import { useChatContext } from "@/context/ChatContext";
import { ChatConversationDto } from "@/dtos";
import { pusherClient, setPusherAuthToken } from "@/lib/pusher";
import { messageService } from "@/services/message.service";

const dedup = (list: ChatConversationDto[]) =>
  list.filter(
    (item, index, self) => self.findIndex((c) => c.id === item.id) === index
  );

export function useChatList() {
  const { profile } = useAuth();
  const currentUserId = profile?.id;

  const {
    conversations,
    setConversations,
    filteredConversations,
    setFilteredConversations,
  } = useChatContext();

  const activeChannelRef = useRef<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const list = await messageService.getConversations();
      const sorted = [...list].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setConversations(dedup(sorted));
      setFilteredConversations(dedup(sorted));
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, [setConversations, setFilteredConversations]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!currentUserId) return;

    const channelName = `private-${currentUserId}`;

    if (activeChannelRef.current === channelName) {
      console.log(
        "[useChatList] 🔒 Kênh đã được bảo vệ, bỏ qua Sub lại:",
        channelName
      );
      return;
    }

    activeChannelRef.current = channelName;
    let isMounted = true;

    const setupPusher = async () => {
      try {
        await setPusherAuthToken();
        if (!isMounted) return;

        const channel = pusherClient.subscribe(channelName);

        const handleRefreshFlow = () => {
          messageService
            .getConversations()
            .then((list) => {
              if (!isMounted) return;
              const sorted = [...list].sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
              );
              setConversations(dedup(sorted));
              setFilteredConversations(dedup(sorted));
            })
            .catch((err) => console.error("Error inline refetching:", err));
        };

        channel.bind("conversation-restored", (data: any) => {
          handleRefreshFlow();
        });

        channel.bind("new-message", (data: any) => {
          handleRefreshFlow();
        });

        channel.bind("new-box", (data: any) => {
          handleRefreshFlow();
        });

        channel.bind("pusher:subscription_error", (err: any) => {
          console.error("[useChatList] ❌ Lỗi kết nối Kênh:", err);
        });
      } catch (err) {
        console.error("Pusher connection setup failure:", err);
      }
    };

    setupPusher();

    return () => {
      if (activeChannelRef.current !== channelName) {
        isMounted = false;
        pusherClient.unsubscribe(channelName);
        activeChannelRef.current = null;
      }
    };
  }, [currentUserId, setConversations, setFilteredConversations]);

  return {
    conversations,
    filteredConversations,
    refetch,
    setSearchQuery: (query: string) => {
      if (!query.trim()) {
        setFilteredConversations(conversations);
        return;
      }
      const lower = query.toLowerCase();
      const filtered = conversations.filter((c) =>
        c.name?.toLowerCase().includes(lower)
      );
      setFilteredConversations(filtered);
    },
  };
}
