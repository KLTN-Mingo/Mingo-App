import { UserRole } from './user.dto';

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export interface LoginRequestDto {
  phoneNumber: string;
  password: string;
}

export interface RegisterRequestDto {
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
  phoneNumber: string;
  name?: string;
  avatar?: string;
  role: UserRole | string;
  verified: boolean;
}

export interface AuthResponseDto {
  accessToken: string;
  user: AuthUserDto;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
}