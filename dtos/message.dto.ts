import { PaginationDto } from "./common.dto";
import { UserMinimalDto } from "./user.dto";

// ─── Enums ─────────────────────────────────────────────────────────────────────

export enum MessageContentType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  FILE = "file",
}

export enum ConversationType {
  DM = "dm",
  GROUP = "group",
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface SendMessageRequestDto {
  content: string;
}

export interface CreateGroupRequestDto {
  name: string;
  memberIds: string[];
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

export interface MessageAttachmentDto {
  id?: string;
  url: string;
  type: string;
  fileName?: string;
  width?: string;
  height?: string;
  duration?: number;
}

export interface MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: UserMinimalDto;
  content: string;
  attachment?: MessageAttachmentDto;
  contentType?: MessageContentType;
  createdAt: string;
  updatedAt?: string;
  isRevoked?: boolean;
  readBy?: string[];
}

export interface ChatConversationDto {
  id: string;
  type: ConversationType;
  name: string;
  avatarUrl?: string;
  lastMessage?: MessageResponseDto;
  unreadCount?: number;
  updatedAt: string;
  participantIds?: string[];
  participants?: UserMinimalDto[];
}

export interface PaginatedMessagesDto {
  messages: MessageResponseDto[];
  pagination: PaginationDto;
}
