"use client";

import { ChatConversationDto } from "@/dtos";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface ChatContextType {
  conversations: ChatConversationDto[];
  setConversations: React.Dispatch<
    React.SetStateAction<ChatConversationDto[]>
  >;
  filteredConversations: ChatConversationDto[];
  setFilteredConversations: React.Dispatch<
    React.SetStateAction<ChatConversationDto[]>
  >;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<ChatConversationDto[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    ChatConversationDto[]
  >([]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        setConversations,
        filteredConversations,
        setFilteredConversations,
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
