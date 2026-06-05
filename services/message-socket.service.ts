import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";

import { MessageResponseDto } from "@/dtos";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:3000";

export interface MessageSocketEvents {
  /** message:new — tin nhắn mới trong box. */
  onNewMessage?: (msg: MessageResponseDto) => void;
  /** message:updated — tin được edit. */
  onMessageUpdated?: (msg: MessageResponseDto) => void;
  /** message:deleted — tin bị thu hồi. */
  onMessageDeleted?: (data: { messageId: string; boxId: string }) => void;
  /** message:read — đối phương đã đọc. */
  onMessageRead?: (data: { boxId: string; userId: string }) => void;
  /** message:typing — đối phương đang gõ. */
  onTyping?: (data: { boxId: string; userId: string; isTyping: boolean }) => void;
  /** user:online / user:offline */
  onUserOnline?: (userId: string) => void;
  onUserOffline?: (userId: string) => void;
  onError?: (err: unknown) => void;
}

let socket: Socket | null = null;
const listeners = new Set<MessageSocketEvents>();

export function getMessageSocket(): Socket | null {
  return socket;
}

export function isMessageSocketConnected(): boolean {
  return !!socket?.connected;
}

export async function connectMessageSocket(userId: string): Promise<void> {
  if (socket && socket.connected) return;
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const token = await AsyncStorage.getItem("accessToken");

  socket = io(`${SOCKET_URL}/messages`, {
    transports: ["websocket"],
    auth: token ? { token, userId } : { userId },
    query: { userId },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1500,
  });

  socket.on("connect", () => {
    console.log("[msg-socket] connected", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[msg-socket] disconnected", reason);
  });

  socket.on("connect_error", (err) => {
    console.warn("[msg-socket] connect_error", err.message);
    listeners.forEach((l) => l.onError?.(err));
  });

  socket.on("message:new", (msg: MessageResponseDto) => {
    listeners.forEach((l) => l.onNewMessage?.(msg));
  });

  socket.on("message:updated", (msg: MessageResponseDto) => {
    listeners.forEach((l) => l.onMessageUpdated?.(msg));
  });

  socket.on("message:deleted", (data: { messageId: string; boxId: string }) => {
    listeners.forEach((l) => l.onMessageDeleted?.(data));
  });

  socket.on("message:read", (data: { boxId: string; userId: string }) => {
    listeners.forEach((l) => l.onMessageRead?.(data));
  });

  socket.on("message:typing", (data: { boxId: string; userId: string; isTyping: boolean }) => {
    listeners.forEach((l) => l.onTyping?.(data));
  });

  socket.on("user:online", (userId: string) => {
    listeners.forEach((l) => l.onUserOnline?.(userId));
  });

  socket.on("user:offline", (userId: string) => {
    listeners.forEach((l) => l.onUserOffline?.(userId));
  });
}

export function disconnectMessageSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  listeners.clear();
}

/** Đăng ký listener — trả về unsubscribe fn. */
export function subscribeMessageEvents(handlers: MessageSocketEvents): () => void {
  listeners.add(handlers);
  return () => {
    listeners.delete(handlers);
  };
}

export function emitJoinBox(boxId: string): void {
  socket?.emit("box:join", { boxId });
}

export function emitLeaveBox(boxId: string): void {
  socket?.emit("box:leave", { boxId });
}

export function emitTyping(boxId: string, isTyping: boolean): void {
  socket?.emit("message:typing", { boxId, isTyping });
}

export function emitMessageRead(boxId: string): void {
  socket?.emit("message:read", { boxId });
}
