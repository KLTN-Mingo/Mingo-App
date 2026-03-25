import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  AuthUserDto,
  PublicUserDto,
  UpdateProfileRequestDto,
  UserProfileDto,
} from "@/dtos";
import { authService } from "@/services/auth.service";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

class UserService {
  private extractErrorMessage(json: Record<string, unknown>): string {
    const directMessage =
      typeof json.message === "string" ? json.message : undefined;
    const nestedError =
      typeof json.error === "string"
        ? json.error
        : typeof (json.error as Record<string, unknown> | undefined)
              ?.message === "string"
          ? ((json.error as Record<string, unknown>).message as string)
          : undefined;

    return directMessage || nestedError || "Đã xảy ra lỗi";
  }

  private extractData<T>(json: Record<string, unknown>): T | undefined {
    const data = json.data;
    if (data !== undefined) {
      if (
        data &&
        typeof data === "object" &&
        (data as Record<string, unknown>).user !== undefined
      ) {
        return (data as Record<string, unknown>).user as T;
      }
      return data as T;
    }

    if (json.user !== undefined) return json.user as T;
    if (json.result !== undefined) return json.result as T;
    if (json.payload !== undefined) return json.payload as T;

    return undefined;
  }

  private mapPublicToProfile(
    publicUser: PublicUserDto,
    storedUser: AuthUserDto
  ): UserProfileDto {
    return {
      id: publicUser.id,
      phoneNumber: storedUser.phoneNumber,
      email: undefined,
      name: publicUser.name ?? storedUser.name,
      bio: publicUser.bio,
      avatar: publicUser.avatar ?? storedUser.avatar,
      backgroundUrl: publicUser.backgroundUrl,
      dateOfBirth: undefined,
      gender: publicUser.gender,
      role: storedUser.role as UserProfileDto["role"],
      verified: Boolean(publicUser.verified ?? storedUser.verified),
      twoFactorEnabled: false,
      isActive: true,
      isBlocked: false,
      onlineStatus: Boolean(publicUser.onlineStatus),
      followersCount: Number(publicUser.followersCount) || 0,
      followingCount: Number(publicUser.followingCount) || 0,
      postsCount: Number(publicUser.postsCount) || 0,
      lastLogin: undefined,
      createdAt: publicUser.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    let token: string | null = null;
    try {
      token = await AsyncStorage.getItem("accessToken");
    } catch (e) {
      console.warn("AsyncStorage not available:", e);
    }
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_URL}/users${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    let json: Record<string, unknown> = {};
    try {
      const text = await response.text();
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Phản hồi từ máy chủ không hợp lệ");
    }

    const message = this.extractErrorMessage(json);

    if (!response.ok) {
      await authService.handleUnauthorizedResponse(response, message);
      throw new Error(message);
    }

    const data = this.extractData<T>(json);
    if (data === undefined) {
      throw new Error("Không nhận được dữ liệu hợp lệ");
    }
    return data;
  }

  /** Chuẩn hóa user từ BE (có thể trả _id) sang đúng DTO (id) */
  private normalizeUserProfile(raw: any): UserProfileDto {
    if (!raw) throw new Error("Không có dữ liệu hồ sơ");
    const id = raw.id ?? raw._id?.toString?.() ?? String(raw._id);
    return {
      ...raw,
      id,
      role: raw.role ?? "user",
      twoFactorEnabled: Boolean(raw.twoFactorEnabled),
      isActive: raw.isActive !== false,
      isBlocked: Boolean(raw.isBlocked),
      onlineStatus: Boolean(raw.onlineStatus),
      followersCount: Number(raw.followersCount) || 0,
      followingCount: Number(raw.followingCount) || 0,
      postsCount: Number(raw.postsCount) || 0,
      verified: Boolean(raw.verified),
      createdAt: raw.createdAt ?? new Date().toISOString(),
      updatedAt: raw.updatedAt ?? new Date().toISOString(),
    };
  }

  // Get current user profile from stored session + /users/:id
  async getCurrentUser(): Promise<UserProfileDto> {
    const storedUser = await authService.getStoredUser();

    if (!storedUser?.id) {
      throw new Error("Không tìm thấy phiên đăng nhập");
    }

    try {
      const publicUser = await this.getUserById(storedUser.id);
      return this.mapPublicToProfile(publicUser, storedUser);
    } catch {
      // Keep UI usable even when profile endpoint is unstable.
      return this.normalizeUserProfile({
        id: storedUser.id,
        phoneNumber: storedUser.phoneNumber,
        name: storedUser.name,
        avatar: storedUser.avatar,
        role: storedUser.role,
        verified: storedUser.verified,
      });
    }
  }

  // Get public user profile by ID
  async getUserById(userId: string): Promise<PublicUserDto> {
    return this.request<PublicUserDto>(`/${userId}`);
  }

  // Update current user profile
  async updateProfile(
    payload: UpdateProfileRequestDto
  ): Promise<UserProfileDto> {
    return this.request<UserProfileDto>("/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }
}

export const userService = new UserService();
