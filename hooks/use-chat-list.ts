import { useCallback, useEffect } from "react";

import { useChatContext } from "@/context/ChatContext";
import { messageService } from "@/services/message.service";

export function useChatList() {
  const {
    conversations,
    setConversations,
    filteredConversations,
    setFilteredConversations,
  } = useChatContext();

  const refetch = useCallback(async () => {
    try {
      const list = await messageService.getConversations();
      const sorted = [...list].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setConversations(sorted);
      setFilteredConversations(sorted);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
      setFilteredConversations([]);
    }
  }, [setConversations, setFilteredConversations]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const setSearchQuery = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) {
        setFilteredConversations(conversations);
        return;
      }
      const filtered = conversations.filter((c) =>
        c.name.toLowerCase().includes(q)
      );
      setFilteredConversations(filtered);
    },
    [conversations, setFilteredConversations]
  );

  return {
    conversations,
    filteredConversations,
    refetch,
    setSearchQuery,
  };
}
