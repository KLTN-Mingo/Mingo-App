import { io, Socket } from "socket.io-client";

import {
  NotificationCountDto,
  NotificationResponseDto,
} from "@/dtos";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:3000";

type NotificationUpsertHandler = (notification: NotificationResponseDto) => void;
type NotificationRemoveHandler = (id: string) => void;
type NotificationCountHandler = (count: NotificationCountDto) => void;
type NotificationErrorHandler = (error: unknown) => void;

export type NotificationSocketHandlers = {
  onNewNotification: NotificationUpsertHandler;
  onNotificationCount: NotificationCountHandler;
  onRemoveNotification: NotificationRemoveHandler;
  onError: NotificationErrorHandler;
};

let socket: Socket | null = null;
let currentUserId: string | null = null;
let isConnected = false;

export function getNotificationSocket() {
  return socket;
}

export function isNotificationSocketConnected() {
  return isConnected;
}

export function connectNotificationSocket(
  userId: string,
  handlers: NotificationSocketHandlers
) {
  if (socket && currentUserId === userId) {
    return socket;
  }

  disconnectNotificationSocket();

  currentUserId = userId;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    isConnected = true;
    socket?.emit("register", { userId });
  });

  socket.on("disconnect", () => {
    isConnected = false;
  });

  socket.on("connect_error", (err) => {
    console.error("Notification socket connection error:", err);
    isConnected = false;
  });

  socket.on("notification", handlers.onNewNotification);
  socket.on("notification:new", handlers.onNewNotification);
  socket.on("notification:count", handlers.onNotificationCount);

  socket.on(
    "notification:updated",
    (
      payload:
        | { type: "markAsRead"; notificationId: string; isRead: true; isSeen: true }
        | { type: "markAsSeen"; notificationId: string; isSeen: true }
        | { type: "markAllAsRead"; count: number }
        | { type: "markAllAsSeen"; count: number }
        | { type: "deleteOne"; notificationId: string }
        | { type: "deleteAllRead"; count: number }
        | { type: "deleteAll"; count: number }
    ) => {
      if (payload.type === "deleteOne") {
        handlers.onRemoveNotification(payload.notificationId);
      }
    }
  );

  socket.on("notification:error", (err) => {
    console.error("Notification socket error:", err);
    handlers.onError(err);
  });

  socket.on("notification:read:done", ({ notificationId }: { notificationId: string }) => {
    console.log("Notification read:", notificationId);
  });

  socket.on("notification:seen:done", ({ notificationId }: { notificationId: string }) => {
    console.log("Notification seen:", notificationId);
  });

  socket.on("notification:seen-all:done", ({ count }: { count: number }) => {
    console.log("Notification seen all:", count);
  });

  return socket;
}

export function emitMarkAsRead(notificationId: string) {
  if (!socket?.connected) return;
  socket.emit("notification:read", notificationId);
}

export function emitMarkAsSeen(notificationId: string) {
  if (!socket?.connected) return;
  socket.emit("notification:seen", notificationId);
}

export function emitMarkAllAsSeen() {
  if (!socket?.connected) return;
  socket.emit("notification:seen-all");
}

export function disconnectNotificationSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentUserId = null;
  isConnected = false;
}
