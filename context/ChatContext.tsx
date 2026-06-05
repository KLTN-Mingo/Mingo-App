"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { ChatConversationDto, MessageResponseDto } from "@/dtos";
import {
  connectMessageSocket,
  disconnectMessageSocket,
  isMessageSocketConnected,
  subscribeMessageEvents,
} from "@/services/message-socket.service";

interface ChatContextType {
  conversations: ChatConversationDto[];
  setConversations: React.Dispatch<
    React.SetStateAction<ChatConversationDto[]>
  >;
  filteredConversations: ChatConversationDto[];
  setFilteredConversations: React.Dispatch<
    React.SetStateAction<ChatConversationDto[]>
  >;
  /** Tập user đang online (set của userId). */
  onlineUsers: Set<string>;
  isSocketConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  /** Truyền userId từ AuthContext để mount socket. */
  userId?: string | null;
}

export function ChatProvider({ children, userId }: ChatProviderProps) {
  const [conversations, setConversations] = useState<ChatConversationDto[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    ChatConversationDto[]
  >([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const bumpConversation = useCallback((msg: MessageResponseDto) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === msg.conversationId);
      if (idx < 0) return prev;
      const updated = { ...prev[idx] };
      updated.lastMessage = msg;
      updated.updatedAt = msg.createdAt;
      updated.unreadCount = (updated.unreadCount ?? 0) + 1;
      // Move to top
      const next = [updated, ...prev.filter((_, i) => i !== idx)];
      return next;
    });
  }, []);

  useEffect(() => {
    if (!userId) {
      disconnectMessageSocket();
      setIsSocketConnected(false);
      setOnlineUsers(new Set());
      return;
    }

    let cancelled = false;
    connectMessageSocket(userId)
      .then(() => {
        if (!cancelled) setIsSocketConnected(isMessageSocketConnected());
      })
      .catch((e) => console.warn("[msg-socket] connect failed", e));

    const unsubscribe = subscribeMessageEvents({
      onNewMessage: (msg) => {
        bumpConversation(msg);
      },
      onUserOnline: (uid) => {
        setOnlineUsers((prev) => {
          if (prev.has(uid)) return prev;
          const next = new Set(prev);
          next.add(uid);
          return next;
        });
      },
      onUserOffline: (uid) => {
        setOnlineUsers((prev) => {
          if (!prev.has(uid)) return prev;
          const next = new Set(prev);
          next.delete(uid);
          return next;
        });
      },
    });

    const interval = setInterval(
      () => setIsSocketConnected(isMessageSocketConnected()),
      15000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
      unsubscribe();
      disconnectMessageSocket();
    };
  }, [userId, bumpConversation]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        setConversations,
        filteredConversations,
        setFilteredConversations,
        onlineUsers,
        isSocketConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
