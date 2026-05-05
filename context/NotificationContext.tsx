import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  NotificationCountDto,
  NotificationResponseDto,
} from "@/dtos";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
  emitMarkAllAsSeen,
  emitMarkAsRead,
  emitMarkAsSeen,
  getNotificationSocket,
  isNotificationSocketConnected,
} from "@/services/notification-socket.service";
import { notificationService } from "@/services/notification.service";

interface NotificationContextValue {
  count: NotificationCountDto;
  notifications: NotificationResponseDto[];
  isConnected: boolean;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAsSeen: (notificationId: string) => Promise<void>;
  markAllAsSeen: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  addNotification: (notification: NotificationResponseDto) => void;
  removeNotification: (notificationId: string) => void;
  updateCount: (count: NotificationCountDto) => void;
}

const defaultCount: NotificationCountDto = {
  total: 0,
  unread: 0,
  unseen: 0,
};

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export function NotificationProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId?: string | null;
}) {
  const [count, setCount] = useState<NotificationCountDto>(defaultCount);
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>(
    []
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitialCount = useCallback(async () => {
    try {
      const countData = await notificationService.getNotificationCount();
      setCount(countData);
    } catch (error) {
      console.warn("Cannot fetch notification count:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNewNotification = useCallback(
    (notification: NotificationResponseDto) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === notification.id);
        if (exists) {
          return prev.map((n) =>
            n.id === notification.id ? notification : n
          );
        }
        return [notification, ...prev];
      });

      setCount((prev) => ({
        ...prev,
        total: prev.total + 1,
        unread: prev.unread + 1,
        unseen: prev.unseen + 1,
      }));
    },
    []
  );

  const handleRemoveNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => {
      const removed = prev.find((n) => n.id === notificationId);
      if (removed) {
        setCount((c) => ({
          ...c,
          total: Math.max(0, c.total - 1),
          unread: !removed.isRead
            ? Math.max(0, c.unread - 1)
            : c.unread,
          unseen: !removed.isSeen
            ? Math.max(0, c.unseen - 1)
            : c.unseen,
        }));
      }
      return prev.filter((n) => n.id !== notificationId);
    });
  }, []);

  const handleCountUpdate = useCallback((newCount: NotificationCountDto) => {
    setCount(newCount);
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.error("Notification socket error:", error);
  }, []);

  useEffect(() => {
    if (!userId) {
      setCount(defaultCount);
      setNotifications([]);
      setIsConnected(false);
      disconnectNotificationSocket();
      return;
    }

    fetchInitialCount();

    connectNotificationSocket(userId, {
      onNewNotification: handleNewNotification,
      onNotificationCount: handleCountUpdate,
      onRemoveNotification: handleRemoveNotification,
      onError: handleError,
    });

    setIsConnected(isNotificationSocketConnected());

    const interval = setInterval(() => {
      setIsConnected(isNotificationSocketConnected());

      if (!isNotificationSocketConnected()) {
        fetchInitialCount();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      disconnectNotificationSocket();
    };
  }, [
    userId,
    fetchInitialCount,
    handleNewNotification,
    handleCountUpdate,
    handleRemoveNotification,
    handleError,
  ]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      emitMarkAsRead(notificationId);
      await notificationService.markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );

      setCount((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }, []);

  const markAsSeen = useCallback(async (notificationId: string) => {
    try {
      emitMarkAsSeen(notificationId);
      await notificationService.markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true, isSeen: true } : n
        )
      );

      setCount((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        unseen: Math.max(0, prev.unseen - 1),
      }));
    } catch (error) {
      console.error("Error marking as seen:", error);
    }
  }, []);

  const markAllAsSeen = useCallback(async () => {
    try {
      emitMarkAllAsSeen();
      await notificationService.markAllAsSeen();

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, isSeen: true }))
      );

      setCount((prev) => ({
        ...prev,
        unread: 0,
        unseen: 0,
      }));
    } catch (error) {
      console.error("Error marking all as seen:", error);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await notificationService.getNotifications(1, 20);
      setNotifications(result.notifications);
      const countData = await notificationService.getNotificationCount();
      setCount(countData);
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addNotification = useCallback(
    (notification: NotificationResponseDto) => {
      handleNewNotification(notification);
    },
    [handleNewNotification]
  );

  const removeNotification = useCallback(
    (notificationId: string) => {
      handleRemoveNotification(notificationId);
    },
    [handleRemoveNotification]
  );

  const updateCount = useCallback((newCount: NotificationCountDto) => {
    setCount(newCount);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        count,
        notifications,
        isConnected,
        isLoading,
        markAsRead,
        markAsSeen,
        markAllAsSeen,
        refreshNotifications,
        addNotification,
        removeNotification,
        updateCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within NotificationProvider"
    );
  }
  return context;
}
