// ─── Enums ─────────────────────────────────────────────────────────────────────

export type DevicePlatform = "ios" | "android" | "web";

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export interface RegisterDeviceRequestDto {
  token: string;
  platform: DevicePlatform;
  deviceLabel?: string;
  appVersion?: string;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export interface DeviceDto {
  id: string;
  token: string;
  platform: DevicePlatform;
  deviceLabel?: string;
  appVersion?: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}
