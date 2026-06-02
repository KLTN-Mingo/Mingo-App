import { useCallback, useEffect, useRef, useState } from "react";

import { MessageResponseDto } from "@/dtos";
import { messageService } from "@/services/message.service";

const PAGE_SIZE = 20;

export function useChatMessages(
  conversationId: string | undefined,
  isGroup: boolean = false,
  onMessageSent?: (message: MessageResponseDto) => void
) {
  const [allMessages, setAllMessages] = useState<MessageResponseDto[]>([]);
  const [messages, setMessages] = useState<MessageResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(1);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setAllMessages([]);
      setMessages([]);
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      setIsLoading(true);
      pageRef.current = 1;
      const list = await messageService.getMessagesForBox(
        conversationId,
        isGroup
      );
      setAllMessages(list);
      const sliced = list.slice(-PAGE_SIZE);
      setMessages(sliced);
      setHasMore(list.length > PAGE_SIZE);
    } catch (err: any) {
      setError(err.message || "Failed to load messages");
      setAllMessages([]);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isGroup]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    const totalLoaded = nextPage * PAGE_SIZE;
    const sliced = allMessages.slice(-totalLoaded);
    setMessages(sliced);
    setHasMore(allMessages.length > totalLoaded);
    setIsLoadingMore(false);
  }, [allMessages, hasMore, isLoadingMore]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) return;
      try {
        await messageService.sendMessage(conversationId, content.trim());
        const latest = await messageService.getMessagesForBox(
          conversationId,
          isGroup
        );
        const newMsg = latest[latest.length - 1];
        if (!newMsg) return;
        setAllMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          const next = [...prev, newMsg];
          setMessages((cur) => {
            if (cur.some((m) => m.id === newMsg.id)) return cur;
            return [...cur, newMsg];
          });
          return next;
        });
        onMessageSent?.(newMsg);
      } catch (err: any) {
        console.error("Error sending message:", err);
        throw err;
      }
    },
    [conversationId, isGroup, onMessageSent]
  );

  const sendFile = useCallback(
    async (file: {
      uri: string;
      type: string;
      name?: string | null;
      duration?: number;
    }) => {
      if (!conversationId) return;
      try {
        await messageService.sendMediaMessage(conversationId, file);
        const latest = await messageService.getMessagesForBox(
          conversationId,
          isGroup
        );
        const newMsg = latest[latest.length - 1];
        if (!newMsg) return;
        setAllMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          const next = [...prev, newMsg];
          setMessages((cur) => {
            if (cur.some((m) => m.id === newMsg.id)) return cur;
            return [...cur, newMsg];
          });
          return next;
        });
        onMessageSent?.(newMsg);
      } catch (err: any) {
        console.error("Error sending file:", err);
        throw err;
      }
    },
    [conversationId, isGroup, onMessageSent]
  );

  const markAsRead = useCallback(async () => {
    if (!conversationId) return;
    try {
      await messageService.markAsRead(conversationId);
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  }, [conversationId]);

  const appendMessage = useCallback((message: MessageResponseDto) => {
    setAllMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      const next = [...prev, message];
      setMessages(next.slice(-PAGE_SIZE));
      setHasMore(next.length > PAGE_SIZE);
      return next;
    });
  }, []);

  /** Cập nhật 1 message khi BE bắn `message:updated` (edit/recall). */
  const replaceMessage = useCallback((updated: MessageResponseDto) => {
    setAllMessages((prev) =>
      prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
    );
    setMessages((prev) =>
      prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
    );
  }, []);

  /** Đánh dấu message bị thu hồi (xóa từ phía user). */
  const markMessageRevoked = useCallback((messageId: string) => {
    setAllMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, isRevoked: true, content: "" } : m
      )
    );
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, isRevoked: true, content: "" } : m
      )
    );
  }, []);

  /** PATCH /messages/:id/edit — sửa text message. */
  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      try {
        const res = await messageService.editMessage(messageId, newContent);
        if (res.message) {
          replaceMessage({
            id: res.message.id,
            conversationId: res.message.boxId,
            senderId: res.message.createBy,
            content: res.message.text ?? newContent,
            createdAt: res.message.createAt,
            updatedAt: new Date().toISOString(),
            isRevoked: false,
            readBy: res.message.readedId ?? [],
          });
        } else {
          // Fallback: cập nhật in-place.
          setAllMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? { ...m, content: newContent, updatedAt: new Date().toISOString() }
                : m
            )
          );
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? { ...m, content: newContent, updatedAt: new Date().toISOString() }
                : m
            )
          );
        }
      } catch (err) {
        console.error("[chat] edit message failed", err);
        throw err;
      }
    },
    [replaceMessage]
  );

  /** DELETE /messages/:id — recall (revoke) tin nhắn. */
  const recallMessage = useCallback(
    async (messageId: string) => {
      try {
        await messageService.deleteOrRevokeMessage(messageId, "revoke");
        markMessageRevoked(messageId);
      } catch (err) {
        console.error("[chat] recall message failed", err);
        throw err;
      }
    },
    [markMessageRevoked]
  );

  return {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refetch: fetchMessages,
    loadMore,
    sendMessage,
    sendFile,
    markAsRead,
    appendMessage,
    replaceMessage,
    markMessageRevoked,
    editMessage,
    recallMessage,
  };
}
