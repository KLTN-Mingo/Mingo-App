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
        if ((result as any)?.isNew && (result as any)?.boxId) {
          onNewBoxCreated?.((result as any).boxId);
        }
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
  };
}
