import { UserRole } from './user.dto';

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export interface LoginRequestDto {
  phoneNumber: string;
  password: string;
}

export interface RegisterRequestDto {
  email?: string;
  phoneNumber: string;
  password: string;
  name?: string;
}

export interface ForgotPasswordRequestDto {
  phoneNumber: string;
}

export interface ResetPasswordRequestDto {
  phoneNumber: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export interface AuthUserDto {
  id: string;
  email?: string;
  phoneNumber: string;
  name?: string;
  avatar?: string;
  role: UserRole | string;
  verified: boolean;
}

export interface AuthResponseDto {
  accessToken: string;
  user: AuthUserDto;
  /** Khi user bật 2FA, BE trả về `requiresTwoFactor=true` + `pendingToken` (chưa có accessToken). */
  requiresTwoFactor?: boolean;
  pendingToken?: string;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
}

// ─── 2FA ──────────────────────────────────────────────────────────────────────

export interface TwoFactorSetupResponseDto {
  /** Base32 secret để user lưu vào Authenticator app (vd Google Authenticator). */
  secret: string;
  /** otpauth:// URL để render QR code. */
  otpauthUrl: string;
  qrCodeDataUrl?: string;
}
