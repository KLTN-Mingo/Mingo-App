import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ApiResponse,
  AuthResponseDto,
  AuthUserDto,
  LoginRequestDto,
  RefreshTokenResponseDto,
  RegisterRequestDto,
  TwoFactorSetupResponseDto,
} from "@/dtos";
import {
  buildRegisterVerificationEndpoint,
  buildRegisterVerificationPayload,
} from "@/services/auth-register-verification";

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

  async clearSession(): Promise<void> {
    await this.clearLocalSession();
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

  async sendRegisterEmailOtp(payload: {
    email: string;
  }): Promise<{ expiresInMinutes: number }> {
    return this.request(
      buildRegisterVerificationEndpoint("email", "send"),
      {
        method: "POST",
        body: JSON.stringify(
          buildRegisterVerificationPayload("email", payload.email)
        ),
      }
    );
  }

  async verifyRegisterEmailOtp(payload: {
    email: string;
    code: string;
  }): Promise<{ verified: true }> {
    return this.request(
      buildRegisterVerificationEndpoint("email", "verify"),
      {
        method: "POST",
        body: JSON.stringify({
          ...buildRegisterVerificationPayload("email", payload.email),
          code: payload.code.trim(),
        }),
      }
    );
  }

  async sendRegisterPhoneOtp(payload: {
    phoneNumber: string;
  }): Promise<{ expiresInMinutes: number }> {
    return this.request(
      buildRegisterVerificationEndpoint("phone", "send"),
      {
        method: "POST",
        body: JSON.stringify(
          buildRegisterVerificationPayload("phone", payload.phoneNumber)
        ),
      }
    );
  }

  async verifyRegisterPhoneOtp(payload: {
    phoneNumber: string;
    code: string;
  }): Promise<{ verified: true }> {
    return this.request(
      buildRegisterVerificationEndpoint("phone", "verify"),
      {
        method: "POST",
        body: JSON.stringify({
          ...buildRegisterVerificationPayload("phone", payload.phoneNumber),
          code: payload.code.trim(),
        }),
      }
    );
  }

  async login(payload: LoginRequestDto): Promise<AuthResponseDto> {
    const response = await this.request<AuthResponseDto>("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // Khi 2FA bật, BE chưa trả accessToken — chỉ trả `pendingToken`.
    if (response.accessToken) {
      await AsyncStorage.setItem("accessToken", response.accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));
    }

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

  /** Dùng cookie httpOnly — không cần truyền refreshToken trong body. */
  async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await this.request<RefreshTokenResponseDto>(
        "/refresh-token",
        { method: "POST" }
      );
      if (response?.accessToken) {
        await AsyncStorage.setItem("accessToken", response.accessToken);
        return response.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  }

  async forgotPassword(payload: { phoneNumber: string }): Promise<void> {
    await this.request("/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // ─── Email verification ──────────────────────────────────────────────────────

  async sendEmailVerification(): Promise<void> {
    const token = await AsyncStorage.getItem("accessToken");
    await this.request("/email/send-verification", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async verifyEmail(payload: { email: string; code: string }): Promise<void> {
    await this.request("/email/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // ─── Phone OTP verification ──────────────────────────────────────────────────

  async sendPhoneOtp(): Promise<void> {
    const token = await AsyncStorage.getItem("accessToken");
    await this.request("/phone/send-otp", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async verifyPhoneOtp(payload: {
    phoneNumber: string;
    code: string;
  }): Promise<void> {
    await this.request("/phone/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async resetPassword(payload: {
    phoneNumber: string;
    otp: string;
    newPassword: string;
  }): Promise<void> {
    await this.request("/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const token = await AsyncStorage.getItem("accessToken");
    await this.request("/change-password", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(payload),
    });
  }

  async googleLogin(idToken: string): Promise<AuthResponseDto> {
    const response = await this.request<AuthResponseDto>("/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
    await AsyncStorage.setItem("accessToken", response.accessToken);
    await AsyncStorage.setItem("user", JSON.stringify(response.user));
    return response;
  }

  async setup2FA(): Promise<TwoFactorSetupResponseDto & { qrCode?: string }> {
    const token = await AsyncStorage.getItem("accessToken");
    return this.request("/2fa/setup", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async enable2FA(secret: string, code: string): Promise<void> {
    const token = await AsyncStorage.getItem("accessToken");
    await this.request("/2fa/enable", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ secret, code }),
    });
  }

  async disable2FA(code: string, password: string): Promise<void> {
    const token = await AsyncStorage.getItem("accessToken");
    await this.request("/2fa/disable", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ code, password }),
    });
  }

  async complete2FALogin(body: {
    pendingToken: string;
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
