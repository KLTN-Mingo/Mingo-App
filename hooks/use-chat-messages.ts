import { useCallback, useEffect, useState } from "react";

import { MessageResponseDto } from "@/dtos";
import { messageService } from "@/services/message.service";

export function useChatMessages(
  conversationId: string | undefined,
  isGroup: boolean = false
) {
  const [messages, setMessages] = useState<MessageResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      setIsLoading(true);
      const list = await messageService.getMessagesForBox(conversationId, isGroup);
      setMessages(list);
    } catch (err: any) {
      setError(err.message || "Failed to load messages");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isGroup]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) return;
      try {
        await messageService.sendMessage(conversationId, content.trim());
        await fetchMessages();
      } catch (err: any) {
        console.error("Error sending message:", err);
        throw err;
      }
    },
    [conversationId, fetchMessages]
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
        await fetchMessages();
      } catch (err: any) {
        console.error("Error sending file:", err);
        throw err;
      }
    },
    [conversationId, fetchMessages]
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
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  return {
    messages,
    isLoading,
    error,
    refetch: fetchMessages,
    sendMessage,
    sendFile,
    markAsRead,
    appendMessage,
  };
}
