/**
 * Message service — frontend layer for Mingo Messages API.
 * Uses fetch; request/response types mirror the backend (no api-client import).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ApiResponse,
  ChatConversationDto,
  ConversationType,
  MessageResponseDto,
} from "@/dtos";
import { authService } from "@/services/auth.service";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
const MESSAGES_BASE = `${API_URL}/messages`;

// ─── Response types (mirror backend / api-client) ─────────────────────────────

export interface FileResponse {
  _id: string;
  fileName: string;
  url: string;
  publicId: string;
  bytes: string;
  width: string;
  height: string;
  format: string;
  type: string;
  duration?: number;
}

export interface UserInfo {
  _id: string;
  name?: string;
  avatar?: string;
  phoneNumber?: string;
  onlineStatus?: boolean;
}

export interface MessageResponse {
  id: string;
  flag: boolean;
  isReact: boolean;
  readedId: string[];
  contentId?: FileResponse;
  text: string;
  boxId: string;
  createAt: string;
  createBy: string;
}

export interface GroupMessageResponse extends MessageResponse {
  createName: string;
  createAvatar: string;
}

export interface MessageBoxResponse {
  _id: string;
  senderId: string;
  receiverIds: UserInfo[];
  messageIds: string[];
  groupName: string;
  groupAva: string;
  flag: boolean;
  pin: boolean;
  createAt: string;
  createBy: string;
  lastMessage: MessageResponse | null;
  readStatus: boolean;
  adminId?: string;
}

export interface GroupBoxResponse {
  _id: string;
  senderId: UserInfo;
  receiverIds: UserInfo[];
  messageIds: string[];
  groupName: string;
  groupAva: string;
  flag: boolean;
  pin: boolean;
  createAt: string;
  createBy: string;
  lastMessage: MessageResponse | null;
  readStatus: boolean;
}

export interface BoxListData {
  success: boolean;
  box: MessageBoxResponse[] | GroupBoxResponse[];
}

export interface MessageListData {
  success: boolean;
  messages: MessageResponse[] | GroupMessageResponse[];
}

export interface SingleMessageData {
  success: boolean;
  message?: MessageResponse | GroupMessageResponse;
  messageId?: string;
}

export type DeleteMessageAction = "revoke" | "delete" | "unsend";

/** File-like shape for React Native FormData (uri + name + type). Optional duration for audio. */
export interface MessageFileInput {
  uri: string;
  name?: string | null;
  type?: string;
  duration?: number;
}

export interface FriendOnlineItem {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  onlineStatus: boolean;
}

/**
 * Backend expects content as:
 * - Text: plain string.
 * - Media: JSON string of { fileName, format, type } (FileContentMetaDto).
 * File field name must be "file" (multer.single("file")).
 */
function getMediaTypeFromMime(
  type?: string
): "Image" | "Video" | "Audio" | "Other" {
  if (!type) return "Other";
  const t = type.toLowerCase();
  if (t.startsWith("image/") || t === "image") return "Image";
  if (t.startsWith("video/") || t === "video") return "Video";
  if (t.startsWith("audio/") || t === "audio") return "Audio";
  return "Other";
}

function getFormatFromFileName(name?: string | null): string {
  if (!name) return "unknown";
  const ext = name.split(".").pop();
  return ext?.toLowerCase() ?? "unknown";
}

// ─── Service ─────────────────────────────────────────────────────────────────

class MessageServiceClass {
  private async getAuthHeaders(isFormData: boolean): Promise<Record<string, string>> {
    const token = await authService.getAccessToken();
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
  
    // CHỈ set application/json khi không phải là FormData
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
    // Nếu là FormData, TUYỆT ĐỐI không định nghĩa Content-Type, để fetch tự xử lý
  
    return headers;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: object | FormData;
      query?: Record<string, string>;
    }
  ): Promise<T> {
    const url = new URL(path.startsWith("http") ? path : MESSAGES_BASE + path);
    if (options?.query) {
      Object.entries(options.query).forEach(([k, v]) =>
        url.searchParams.set(k, v)
      );
    }

    const isFormData = options?.body instanceof FormData;
    const headers = await this.getAuthHeaders(isFormData);

    const init: RequestInit = {
      method,
      headers,
      body: isFormData
        ? (options.body as FormData)
        : options?.body != null && typeof options.body === "object"
          ? JSON.stringify(options.body)
          : undefined,
    };

    const response = await fetch(url.toString(), init);
    const json = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      const msg =
        typeof (json as { message?: string }).message === "string"
          ? (json as { message: string }).message
          : "Something went wrong";
      await authService.handleUnauthorizedResponse(response, msg);
      throw new Error(msg);
    }

    return (json as ApiResponse<T>).data;
  }

  /** GET /boxes — direct (1-1) boxes */
  async getDirectBoxes(): Promise<BoxListData> {
    const data = await this.request<BoxListData>("GET", "/boxes");
    return {
      success: (data as BoxListData).success ?? true,
      box: Array.isArray((data as BoxListData).box)
        ? (data as BoxListData).box
        : [],
    };
  }

  /** GET /boxes/groups — group boxes */
  async getGroupBoxes(): Promise<BoxListData> {
    const data = await this.request<BoxListData>("GET", "/boxes/groups");
    return {
      success: (data as BoxListData).success ?? true,
      box: Array.isArray((data as BoxListData).box)
        ? (data as BoxListData).box
        : [],
    };
  }

  /** GET /:boxId — direct messages in a box */
  async getMessages(boxId: string): Promise<MessageListData> {
    const data = await this.request<MessageListData>(
      "GET",
      `/${encodeURIComponent(boxId)}`
    );
    const d = data as MessageListData;
    return {
      success: d.success ?? true,
      messages: Array.isArray(d.messages) ? d.messages : [],
    };
  }

  /** GET /:boxId/media/images — lấy danh sách ảnh trong box */
  async getImageList(boxId: string): Promise<FileResponse[]> {
    const data = await this.request<FileResponse[]>(
      "GET",
      `/${encodeURIComponent(boxId)}/media/images`
    );
    return Array.isArray(data) ? data : [];
  }

  /** GET /:boxId/media/files — lấy danh sách file khác trong box */
  async getFileList(boxId: string): Promise<FileResponse[]> {
    const data = await this.request<FileResponse[]>(
      "GET",
      `/${encodeURIComponent(boxId)}/media/files`
    );
    return Array.isArray(data) ? data : [];
  }

  /** GET /:boxId/search?q=query — tìm kiếm tin nhắn trong box */
  async searchMessages(
    boxId: string,
    query: string
  ): Promise<MessageResponseDto[]> {
    const data = await this.request<{
      success: boolean;
      messages: MessageResponse[];
    }>("GET", `/${encodeURIComponent(boxId)}/search`, {
      query: { q: query },
    });
    const d = data as { success: boolean; messages: MessageResponse[] };
    return Array.isArray(d.messages)
      ? d.messages.map((m) => this.mapMessageToDto(m))
      : [];
  }

  /** GET /:boxId/group — group messages in a box */
  async getGroupMessages(boxId: string): Promise<MessageListData> {
    const data = await this.request<MessageListData>(
      "GET",
      `/${encodeURIComponent(boxId)}/group`
    );
    const d = data as MessageListData;
    return {
      success: d.success ?? true,
      messages: Array.isArray(d.messages) ? d.messages : [],
    };
  }

  async getFriendsWithOnlineStatus(): Promise<FriendOnlineItem[]> {
    const token = await AsyncStorage.getItem("accessToken");
    const response = await fetch(`${API_URL}/messages/friends/online-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const json = await response.json();
    if (!response.ok)
      throw new Error(json.message ?? "Failed to fetch friends");
    return (json.data?.friends ?? []) as FriendOnlineItem[];
  }

  async getOrCreateDirectBox(
    targetUserId: string
  ): Promise<{ boxId: string; isNew: boolean }> {
    const conversations = await this.getConversations();
    const existing = conversations.find(
      (c) =>
        c.type === ConversationType.DM &&
        c.participantIds?.includes(targetUserId)
    );
    if (existing) return { boxId: existing.id, isNew: false };
    return { boxId: targetUserId, isNew: true };
  }

  /**
   * POST /:boxId/send — send text message.
   * Backend: content is required; multipart/form-data with field "content" (plain string).
   */
  async sendMessage(
    boxId: string,
    content: string
  ): Promise<SingleMessageData> {
    const form = new FormData();
    form.append("content", content);
    return this.sendToBox(boxId, form);
  }

  /**
   * POST /:boxId/send — send media message (image, video, audio, document).
   * Backend: content must be JSON string of FileContentMetaDto { fileName, format, type };
   * file field name must be "file" (multer.single("file")).
   */
  async sendMediaMessage(
    boxId: string,
    file: MessageFileInput
  ): Promise<SingleMessageData> {
    const fileName = file.name ?? "file";
    const format = getFormatFromFileName(fileName);
    const type = getMediaTypeFromMime(file.type);

    // duration nằm trong contentMeta, backend đọc từ đây
    const contentMeta: Record<string, unknown> = { fileName, format, type };
    if (typeof file.duration === "number" && file.duration > 0) {
      contentMeta.duration = file.duration;
    }

    const form = new FormData();
    form.append("content", JSON.stringify(contentMeta));
    form.append("file", {
      uri: file.uri,
      name: fileName,
      type: file.type ?? "application/octet-stream",
    } as any);
    // ❌ KHÔNG append duration riêng nữa

    return this.sendToBox(boxId, form);
  }

  // private async sendToBox(
  //   boxId: string,
  //   form: FormData
  // ): Promise<SingleMessageData> {
  //   const headers = await this.getAuthHeaders(true);
  //   const response = await fetch(
  //     `${MESSAGES_BASE}/${encodeURIComponent(boxId)}/send`,
  //     {
  //       method: "POST",
  //       headers,
  //       body: form,
  //     }
  //   );
  //   const json = (await response.json()) as ApiResponse<SingleMessageData>;
  //   if (!response.ok) {
  //     const msg =
  //       typeof (json as { message?: string }).message === "string"
  //         ? (json as { message: string }).message
  //         : "Failed to send message";
  //     await authService.handleUnauthorizedResponse(response, msg);
  //     throw new Error(msg);
  //   }
  //   return json.data as SingleMessageData;
  // }

  private async sendToBox(
    boxId: string,
    form: FormData
  ): Promise<SingleMessageData> {
    const token = await AsyncStorage.getItem("accessToken");
    const url = `${MESSAGES_BASE}/${encodeURIComponent(boxId)}/send`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.timeout = 60000;

      xhr.onload = () => {
        console.log("XHR status:", xhr.status);
        console.log("XHR response:", xhr.responseText);
        try {
          const json = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(json.data as SingleMessageData);
          } else {
            reject(new Error(json.message ?? "Failed to send"));
          }
        } catch {
          reject(new Error("Invalid server response"));
        }
      };

      xhr.onerror = () => {
        console.error("XHR error — url:", url);
        console.error("XHR onerror event:", xhr.onerror);
        reject(new Error("Network request failed"));
      };
      xhr.ontimeout = () => reject(new Error("Request timeout"));

      xhr.send(form);
    });
  }

  /** POST /boxes/:boxId/read — mark box as read */
  async markAsRead(boxId: string): Promise<void> {
    await this.request<{ message?: string }>(
      "POST",
      `/boxes/${encodeURIComponent(boxId)}/read`
    );
  }

  /** PATCH /:messageId/edit — edit a text message */
  async editMessage(
    messageId: string,
    newContent: string
  ): Promise<SingleMessageData> {
    return this.request<SingleMessageData>(
      "PATCH",
      `/${encodeURIComponent(messageId)}/edit`,
      { body: { newContent } }
    );
  }

  /** DELETE /:messageId — revoke, delete, or unsend. body: { action: "revoke" | "delete" | "unsend" } */
  async deleteOrRevokeMessage(
    messageId: string,
    action: DeleteMessageAction
  ): Promise<SingleMessageData> {
    return this.request<SingleMessageData>(
      "DELETE",
      `/${encodeURIComponent(messageId)}`,
      { body: { action } }
    );
  }

  /** DELETE /boxes/:boxId — xóa box chat */
  async deleteBox(boxId: string): Promise<void> {
    await this.request<{ message?: string }>(
      "DELETE",
      `/boxes/${encodeURIComponent(boxId)}`
    );
  }

  /** POST report — tạm thời log, backend chưa có endpoint */
  async reportConversation(boxId: string): Promise<void> {
    // TODO: implement khi backend có endpoint /report
    console.log("Report conversation:", boxId);
  }

  /** GET /boxes/:boxId/detail — group members and info */
  async getGroupDetail(boxId: string): Promise<{
    members: {
      id: string;
      name?: string;
      avatarUrl?: string;
      role: "admin" | "member";
    }[];
  }> {
    const data = await this.request<{
      group: {
        members: {
          _id: string;
          name?: string;
          avatar?: string;
          phoneNumber?: string;
          onlineStatus?: boolean;
        }[];
        adminIds: { _id: string }[];
      };
    }>("GET", `/boxes/${encodeURIComponent(boxId)}/detail`);

    const adminMap = new Set((data.group?.adminIds ?? []).map((a) => a._id));
    return {
      members: (data.group?.members ?? []).map((m) => ({
        id: m._id,
        name: m.name,
        avatarUrl: m.avatar,
        role: adminMap.has(m._id) ? ("admin" as const) : ("member" as const),
      })),
    };
  }

  /** POST /boxes/:boxId/members — add member(s) */
  async addGroupMember(boxId: string, memberId: string): Promise<void> {
    await this.request<{ message?: string }>(
      "POST",
      `/boxes/${encodeURIComponent(boxId)}/members`,
      { body: { memberIds: [memberId] } }
    );
  }

  /** DELETE /boxes/:boxId/members/:memberId — remove a member */
  async removeGroupMember(boxId: string, memberId: string): Promise<void> {
    await this.request<{ message?: string }>(
      "DELETE",
      `/boxes/${encodeURIComponent(boxId)}/members/${encodeURIComponent(memberId)}`
    );
  }

  /** POST /boxes/:boxId/leave — leave the group */
  async leaveGroup(boxId: string): Promise<void> {
    await this.request<{ message?: string }>(
      "POST",
      `/boxes/${encodeURIComponent(boxId)}/leave`
    );
  }

  /** PATCH /boxes/:boxId/admins/promote — promote member to admin */
  async promoteToAdmin(boxId: string, memberId: string): Promise<void> {
    await this.request<{ message?: string }>(
      "PATCH",
      `/boxes/${encodeURIComponent(boxId)}/admins/promote`,
      { body: { memberId } }
    );
  }

  /** PATCH /boxes/:boxId/admins/demote — demote admin to member */
  async demoteFromAdmin(boxId: string, memberId: string): Promise<void> {
    await this.request<{ message?: string }>(
      "PATCH",
      `/boxes/${encodeURIComponent(boxId)}/admins/demote`,
      { body: { memberId } }
    );
  }

  // ─── Helpers for existing UI (map to app DTOs) ───────────────────────────────

  private mapBoxToConversation(
    box: MessageBoxResponse | GroupBoxResponse,
    currentUserId: string
  ): ChatConversationDto {
    const isGroup =
      (box.receiverIds?.length ?? 0) > 2 ||
      !!(box.groupName && box.groupName.trim());
    const lastMsg = box.lastMessage;
    const updatedAt =
      lastMsg?.createAt ??
      (box as MessageBoxResponse).createAt ??
      new Date().toISOString();

    if (isGroup) {
      const participantIds = (box.receiverIds ?? []).map((r) => r._id);
      const participants = (box.receiverIds ?? []).map((r) => ({
        id: r._id,
        name: r.name,
        avatar: r.avatar,
        verified: false,
      }));
      return {
        id: box._id,
        type: ConversationType.GROUP,
        name: box.groupName ?? "Group",
        avatarUrl: box.groupAva,
        updatedAt,
        participantIds,
        participants,
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              conversationId: box._id,
              senderId: lastMsg.createBy,
              content: lastMsg.text ?? "",
              createdAt: lastMsg.createAt,
              isRevoked: lastMsg.flag === false,
              readBy: lastMsg.readedId ?? [],
            }
          : undefined,
        unreadCount: lastMsg && !box.readStatus ? 1 : 0,
      };
    }

    const other = box.receiverIds?.find((r) => r._id !== currentUserId);
    const participantIds = [
      ...new Set([currentUserId, ...(box.receiverIds ?? []).map((r) => r._id)]),
    ];
    const participants = (box.receiverIds ?? [])
      .filter((r) => r._id !== currentUserId)
      .map((r) => ({
        id: r._id,
        name: r.name,
        avatar: r.avatar,
        verified: false,
      }));
    return {
      id: box._id,
      type: ConversationType.DM,
      name: other?.name ?? "Unknown",
      avatarUrl: other?.avatar,
      updatedAt,
      participantIds,
      participants,
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            conversationId: box._id,
            senderId: lastMsg.createBy,
            content: lastMsg.text ?? "",
            createdAt: lastMsg.createAt,
            isRevoked: lastMsg.flag === false,
            readBy: lastMsg.readedId ?? [],
          }
        : undefined,
      unreadCount: lastMsg && !box.readStatus ? 1 : 0,
    };
  }

  private mapMessageToDto(
    msg: MessageResponse | GroupMessageResponse
  ): MessageResponseDto {
    return {
      id: msg.id,
      conversationId: msg.boxId,
      senderId: msg.createBy,
      content: msg.text ?? "",
      createdAt: msg.createAt,
      isRevoked: msg.flag === false,
      readBy: msg.readedId ?? [],
      attachment: msg.contentId?.url
        ? {
            url: msg.contentId.url,
            type: msg.contentId.type ?? "file",
            duration:
              typeof (msg.contentId as FileResponse).duration === "number"
                ? (msg.contentId as FileResponse).duration
                : undefined,
          }
        : undefined,
    };
  }

  /** Single box by ID — returns as ChatConversationDto. */
  async getBoxInfo(boxId: string): Promise<ChatConversationDto | null> {
    try {
      const data = await this.request<{
        box: MessageBoxResponse | GroupBoxResponse;
        readStatus: boolean;
      }>("GET", `/boxes/${encodeURIComponent(boxId)}`);
      const userStr = await AsyncStorage.getItem("user");
      const currentUserId = userStr ? (JSON.parse(userStr)?.id as string) : "";
      if (!data.box) return null;
      return this.mapBoxToConversation(data.box, currentUserId);
    } catch {
      return null;
    }
  }

  /** Combined conversation list (direct + groups) for list screen. */
  async getConversations(): Promise<ChatConversationDto[]> {
    const userStr = await AsyncStorage.getItem("user");
    const currentUserId = userStr ? (JSON.parse(userStr)?.id as string) : "";

    const [directRes, groupRes] = await Promise.all([
      this.getDirectBoxes(),
      this.getGroupBoxes(),
    ]);

    const direct = (directRes.box ?? []).map((box) =>
      this.mapBoxToConversation(box as MessageBoxResponse, currentUserId)
    );
    const groups = (groupRes.box ?? []).map((box) =>
      this.mapBoxToConversation(box as GroupBoxResponse, currentUserId)
    );

    return [...direct, ...groups].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /** Messages for a box (direct or group), returned as app DTOs. */
  async getMessagesForBox(
    boxId: string,
    isGroup: boolean
  ): Promise<MessageResponseDto[]> {
    const data = isGroup
      ? await this.getGroupMessages(boxId)
      : await this.getMessages(boxId);
    return (data.messages ?? []).map((m) => this.mapMessageToDto(m));
  }
}

export const messageService = new MessageServiceClass();
