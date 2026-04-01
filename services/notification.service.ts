import {
  NotificationCountDto,
  NotificationType,
  PaginatedNotificationsDto,
} from "@/dtos";
import { apiRequest } from "@/services/api-client";

class NotificationServiceClass {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return apiRequest<T>(`/notifications${endpoint}`, options);
  }

  // Get notifications with pagination
  async getNotifications(
    page: number = 1,
    limit: number = 20,
    type?: NotificationType,
    isRead?: boolean
  ): Promise<PaginatedNotificationsDto> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (type) params.append("type", type);
    if (isRead !== undefined) params.append("isRead", isRead.toString());

    return this.request<PaginatedNotificationsDto>(`?${params.toString()}`);
  }

  // Get unread notifications
  async getUnreadNotifications(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedNotificationsDto> {
    return this.request<PaginatedNotificationsDto>(
      `/unread?page=${page}&limit=${limit}`
    );
  }

  // Get notification count
  async getNotificationCount(): Promise<NotificationCountDto> {
    return this.request<NotificationCountDto>("/count");
  }

  // Mark single notification as read
  async markAsRead(notificationId: string): Promise<void> {
    return this.request<void>(`/${notificationId}/read`, {
      method: "PUT",
    });
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ count: number }> {
    return this.request<{ count: number }>("/read-all", {
      method: "PUT",
    });
  }

  // Mark all notifications as seen
  async markAllAsSeen(): Promise<{ count: number }> {
    return this.request<{ count: number }>("/seen-all", {
      method: "PUT",
    });
  }

  // Delete single notification
  async deleteNotification(notificationId: string): Promise<void> {
    return this.request<void>(`/${notificationId}`, {
      method: "DELETE",
    });
  }

  // Delete all read notifications
  async deleteAllRead(): Promise<{ count: number }> {
    return this.request<{ count: number }>("/read", {
      method: "DELETE",
    });
  }

  // Delete all notifications
  async deleteAll(): Promise<{ count: number }> {
    return this.request<{ count: number }>("", {
      method: "DELETE",
    });
  }
}

export const notificationService = new NotificationServiceClass();
