import { useCallback, useEffect, useRef, useState } from "react";

import { MessageResponseDto } from "@/dtos";
import { pusherClient, setPusherAuthToken } from "@/lib/pusher";
import { messageService } from "@/services/message.service";

const PAGE_SIZE = 20;

export function useChatMessages(
  conversationId: string | undefined,
  isGroup: boolean = false,
  onMessageSent?: (message: MessageResponseDto) => void,
  onNewBoxCreated?: (newBoxId: string) => void
) {
  const [allMessages, setAllMessages] = useState<MessageResponseDto[]>([]);
  const [messages, setMessages] = useState<MessageResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(1);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Reset toàn bộ state khi đổi conversation để tránh stale data
  useEffect(() => {
    setAllMessages([]);
    setMessages([]);
    setHasMore(false);
    setError(null);
    setIsLoading(true);
    pageRef.current = 1;
  }, [conversationId]);

  // ── Fetch messages ──────────────────────────────────────────────────────────
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
      setMessages(list.slice(-PAGE_SIZE));
      setHasMore(list.length > PAGE_SIZE);
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      if (
        msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("something went wrong")
      ) {
        setAllMessages([]);
        setMessages([]);
        setError(null);
      } else {
        setError(msg || "Failed to load messages");
        setAllMessages([]);
        setMessages([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isGroup]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ── Pusher real-time ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId) return;

    const channelName = `private-${conversationId}`;

    const setup = async () => {
      try {
        // Set token trước khi subscribe
        await setPusherAuthToken();

        const channel = pusherClient.subscribe(channelName);

        channel.bind("new-message", (data: any) => {
          if (!mountedRef.current) return;

          const newMsg: MessageResponseDto = {
            id: data.id,
            conversationId: data.boxId,
            senderId: data.createBy,
            sender:
              typeof data.createName === "string" ||
              typeof data.createAvatar === "string"
                ? {
                    id: data.createBy,
                    name:
                      typeof data.createName === "string"
                        ? data.createName
                        : undefined,
                    avatar:
                      typeof data.createAvatar === "string"
                        ? data.createAvatar
                        : undefined,
                    verified: false,
                  }
                : undefined,
            content: data.text ?? "",
            createdAt: data.createAt,
            isRevoked: data.flag === false,
            readBy: data.readedId ?? [],
            attachment: data.contentId?.url
              ? {
                  url: data.contentId.url,
                  type: data.contentId.type ?? "file",
                  duration: data.contentId.duration,
                }
              : undefined,
          };

          setAllMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          setMessages((cur) => {
            if (cur.some((m) => m.id === newMsg.id)) return cur;
            return [...cur, newMsg];
          });
        });

        channel.bind("revoke-message", (data: any) => {
          if (!mountedRef.current) return;
          const update = (list: MessageResponseDto[]) =>
            list.map((m) =>
              m.id === data.id
                ? { ...m, isRevoked: true, content: "Message revoked" }
                : m
            );
          setAllMessages(update);
          setMessages(update);
        });

        channel.bind("message-edited", (data: any) => {
          if (!mountedRef.current) return;
          const update = (list: MessageResponseDto[]) =>
            list.map((m) =>
              m.id === data.id
                ? {
                    ...m,
                    content: data.text,
                    isEdited: true,
                    updatedAt: data.updatedAt,
                  }
                : m
            );
          setAllMessages(update);
          setMessages(update);
        });

        channel.bind("delete-message", (data: any) => {
          if (!mountedRef.current) return;
          const update = (list: MessageResponseDto[]) =>
            list.map((m) =>
              m.id === data.id
                ? { ...m, isDeleted: true, content: "Message deleted" }
                : m
            );
          setAllMessages(update);
          setMessages(update);
        });

        channel.bind("unsend-message", (data: any) => {
          if (!mountedRef.current) return;
          const update = (list: MessageResponseDto[]) =>
            list.map((m) =>
              m.id === data.id
                ? { ...m, isRevoked: true, content: "Message unsent" }
                : m
            );
          setAllMessages(update);
          setMessages(update);
        });

        channel.bind("pusher:subscription_error", (err: any) => {
          console.error("Pusher subscription error:", err);
        });
      } catch (err) {
        console.error("Pusher setup error:", err);
      }
    };

    setup();

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [conversationId]);

  // ── Load more ───────────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    const totalLoaded = nextPage * PAGE_SIZE;
    setMessages(allMessages.slice(-totalLoaded));
    setHasMore(allMessages.length > totalLoaded);
    setIsLoadingMore(false);
  }, [allMessages, hasMore, isLoadingMore]);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) return;
      try {
        const result = await messageService.sendMessage(
          conversationId,
          content.trim()
        );

        // If a new box was created: navigate immediately, don't fetch.
        // The hook will remount with the new conversationId and fetchMessages will run correctly.
        if ((result as any)?.isNew && (result as any)?.boxId) {
          onNewBoxCreated?.((result as any).boxId);
          return;
        }

        // Existing box: fetch normally
        const actualBoxId = (result as any)?.boxId ?? conversationId;
        const latest = await messageService.getMessagesForBox(
          actualBoxId,
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
    [conversationId, isGroup, onMessageSent, onNewBoxCreated]
  );

  // ── Send file ───────────────────────────────────────────────────────────────
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

  // ── Mark as read ────────────────────────────────────────────────────────────
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;
    try {
      await messageService.markAsRead(conversationId);
    } catch {
      // ignore
    }
  }, [conversationId]);

  // ── Append message ──────────────────────────────────────────────────────────
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
  // ── Update single message locally (edit) ───────────────────────────────────
  const updateMessageLocally = useCallback(
    (messageId: string, newContent: string) => {
      const now = new Date().toISOString();
      const update = (list: MessageResponseDto[]) =>
        list.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent, isEdited: true, updatedAt: now }
            : msg
        );
      setAllMessages(update);
      setMessages(update);
    },
    []
  );

  // ── Revoke message locally (optimistic + Pusher fallback) ─────────────────
  const revokeMessageLocally = useCallback((messageId: string) => {
    const update = (list: MessageResponseDto[]) =>
      list.map((msg) =>
        msg.id === messageId
          ? { ...msg, isRevoked: true, content: "Message revoked" }
          : msg
      );
    setAllMessages(update);
    setMessages(update);
  }, []);

  // ── Delete message locally (optimistic + Pusher fallback) ─────────────────
  const deleteMessageLocally = useCallback((messageId: string) => {
    const update = (list: MessageResponseDto[]) =>
      list.map((msg) =>
        msg.id === messageId
          ? { ...msg, isDeleted: true, content: "Message deleted" }
          : msg
      );
    setAllMessages(update);
    setMessages(update);
  }, []);

  // ── Revert message back to original (rollback on API fail) ───────────────
  // Stores original state snapshot before optimistic update.
  // Callers should store snapshot before calling revoke/delete locally.
  const revertMessageLocally = useCallback(
    (
      messageId: string,
      snapshot: MessageResponseDto
    ) => {
      setAllMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? snapshot : msg))
      );
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? snapshot : msg))
      );
    },
    []
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
    updateMessageLocally,
    revokeMessageLocally,
    deleteMessageLocally,
    revertMessageLocally,
  };
}
