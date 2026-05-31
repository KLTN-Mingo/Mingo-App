import { useCallback, useEffect } from "react";

import { ChatConversationDto, ConversationType } from "@/dtos";
import { useAuth } from "@/context/AuthContext";
import { pusherClient, setPusherAuthToken } from "@/lib/pusher";
import { useChatContext } from "@/context/ChatContext";
import { messageService } from "@/services/message.service";

const dedup = (list: ChatConversationDto[]) =>
  list.filter(
    (item, index, self) =>
      self.findIndex((c) => c.id === item.id) === index
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
      setConversations([]);
      setFilteredConversations([]);
    }
  }, [setConversations, setFilteredConversations]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Subscribe personal channel to receive new-box events (real-time)
  useEffect(() => {
    if (!currentUserId) return;

    const channelName = `private-${currentUserId}`;

    const setup = async () => {
      try {
        await setPusherAuthToken();
        const channel = pusherClient.subscribe(channelName);

        channel.bind("new-box", (data: any) => {
          const newConversation: ChatConversationDto = {
            id: data.boxId,
            type: ConversationType.DM,
            name: data.senderName ?? "Unknown",
            avatarUrl: data.senderAvatar ?? "",
            updatedAt:
              data.lastMessage?.createAt ?? new Date().toISOString(),
            participantIds: [data.senderId, currentUserId],
            participants: [
              {
                id: data.senderId,
                name: data.senderName ?? "Unknown",
                avatar: data.senderAvatar ?? "",
                verified: false,
              },
            ],
            lastMessage: data.lastMessage
              ? {
                  id: data.lastMessage.id,
                  conversationId: data.boxId,
                  senderId: data.senderId,
                  content: data.lastMessage.text ?? "",
                  createdAt: data.lastMessage.createAt,
                  isRevoked: false,
                  readBy: data.lastMessage.readedId ?? [],
                  attachment: data.lastMessage.contentId?.url
                    ? {
                        url: data.lastMessage.contentId.url,
                        type: data.lastMessage.contentId.type ?? "file",
                        duration: data.lastMessage.contentId.duration,
                      }
                    : undefined,
                }
              : undefined,
            unreadCount: 1,
          };

          setConversations((prev) => {
            if (prev.find((c) => c.id === data.boxId)) return prev;
            return [newConversation, ...prev];
          });
          setFilteredConversations((prev) => {
            if (prev.find((c) => c.id === data.boxId)) return prev;
            return [newConversation, ...prev];
          });
        });

        channel.bind("added-to-group", (data: any) => {
          const newGroupConversation: ChatConversationDto = {
            id: data.boxId,
            type: ConversationType.GROUP,
            name: data.groupName ?? "Group",
            avatarUrl: data.groupAva ?? "",
            updatedAt: data.updatedAt ?? new Date().toISOString(),
            participantIds: data.participantIds ?? [],
            participants: (data.members ?? []).map((m: any) => ({
              id: m.id,
              name: m.name ?? "",
              avatar: m.avatar ?? "",
              verified: false,
            })),
            lastMessage: data.lastMessage
              ? {
                  id: data.lastMessage.id,
                  conversationId: data.boxId,
                  senderId: data.lastMessage.createBy,
                  content: data.lastMessage.text ?? "",
                  createdAt: data.lastMessage.createAt,
                  isRevoked: data.lastMessage.flag === false,
                  readBy: data.lastMessage.readedId ?? [],
                }
              : undefined,
            unreadCount: data.lastMessage ? 1 : 0,
          };

          setConversations((prev) => {
            if (prev.find((c) => c.id === data.boxId)) return prev;
            return [newGroupConversation, ...prev];
          });
          setFilteredConversations((prev) => {
            if (prev.find((c) => c.id === data.boxId)) return prev;
            return [newGroupConversation, ...prev];
          });
        });

        channel.bind("pusher:subscription_error", (err: any) => {
          console.error("Pusher personal channel error:", err);
        });
      } catch (err) {
        console.error("Pusher personal channel setup error:", err);
      }
    };

    setup();

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [currentUserId, setConversations, setFilteredConversations]);

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
