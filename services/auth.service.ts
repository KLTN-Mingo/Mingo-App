import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ApiResponse,
  AuthResponseDto,
  AuthUserDto,
  LoginRequestDto,
  RefreshTokenResponseDto,
  RegisterRequestDto,
} from "@/dtos";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

type UnauthorizedHandler = () => void;

class AuthService {
  private unauthorizedHandler?: UnauthorizedHandler;
  private isHandlingUnauthorized = false;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}/auth${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });

    const json: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(json.message || "Something went wrong");
    }

    return json.data;
  }

  setUnauthorizedHandler(handler?: UnauthorizedHandler) {
    this.unauthorizedHandler = handler;
  }

  private isUnauthorizedResponse(
    response: Response,
    message?: string
  ): boolean {
    if (response.status === 401) return true;

    const normalizedMessage = (message || "").toLowerCase();
    return (
      normalizedMessage.includes("jwt expired") ||
      normalizedMessage.includes("token expired")
    );
  }

  private async clearLocalSession(): Promise<void> {
    await AsyncStorage.multiRemove(["accessToken", "user"]);
  }

  async handleUnauthorizedResponse(
    response: Response,
    message?: string
  ): Promise<boolean> {
    if (!this.isUnauthorizedResponse(response, message)) {
      return false;
    }

    await this.clearLocalSession();

    if (!this.isHandlingUnauthorized) {
      this.isHandlingUnauthorized = true;
      try {
        this.unauthorizedHandler?.();
      } finally {
        setTimeout(() => {
          this.isHandlingUnauthorized = false;
        }, 0);
      }
    }

    return true;
  }

  async register(payload: RegisterRequestDto): Promise<AuthResponseDto> {
    const response = await this.request<AuthResponseDto>("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    await AsyncStorage.setItem("accessToken", response.accessToken);
    await AsyncStorage.setItem("user", JSON.stringify(response.user));

    return response;
  }

  async login(payload: LoginRequestDto): Promise<AuthResponseDto> {
    const response = await this.request<AuthResponseDto>("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    await AsyncStorage.setItem("accessToken", response.accessToken);
    await AsyncStorage.setItem("user", JSON.stringify(response.user));

    return response;
  }

  async logout(allDevices = false): Promise<void> {
    const token = await AsyncStorage.getItem("accessToken");

    try {
      await this.request("/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ allDevices }),
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear local storage
    await this.clearLocalSession();
  }

  async getStoredUser(): Promise<AuthUserDto | null> {
    const userStr = await AsyncStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem("accessToken");
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponseDto> {
    const response = await this.request<RefreshTokenResponseDto>(
      "/refresh-token",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }
    );
    await AsyncStorage.setItem("accessToken", response.accessToken);
    return response;
  }

  async googleLogin(googleToken: string): Promise<AuthResponseDto> {
    const response = await this.request<AuthResponseDto>("/google", {
      method: "POST",
      body: JSON.stringify({ googleToken }),
    });
    await AsyncStorage.setItem("accessToken", response.accessToken);
    await AsyncStorage.setItem("user", JSON.stringify(response.user));
    return response;
  }

  async setup2FA(): Promise<{ secret: string; qrCode: string }> {
    const token = await AsyncStorage.getItem("accessToken");
    return this.request("/2fa/setup", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async enable2FA(code: string): Promise<void> {
    const token = await AsyncStorage.getItem("accessToken");
    await this.request("/2fa/enable", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ code }),
    });
  }

  async disable2FA(code: string): Promise<void> {
    const token = await AsyncStorage.getItem("accessToken");
    await this.request("/2fa/disable", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ code }),
    });
  }

  async complete2FALogin(body: {
    phoneNumber?: string;
    email?: string;
    code: string;
  }): Promise<AuthResponseDto> {
    const response = await this.request<AuthResponseDto>(
      "/2fa/complete-login",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
    await AsyncStorage.setItem("accessToken", response.accessToken);
    await AsyncStorage.setItem("user", JSON.stringify(response.user));
    return response;
  }
}

export const authService = new AuthService();
