import {
  DeviceDto,
  RegisterDeviceRequestDto,
} from "@/dtos";
import { apiRequest } from "@/services/api-client";

class DeviceService {
  /** POST /notifications/devices — đăng ký FCM token sau login. */
  async registerDevice(payload: RegisterDeviceRequestDto): Promise<DeviceDto> {
    return apiRequest<DeviceDto>("/notifications/devices", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /** GET /notifications/devices — list thiết bị active của mình. */
  async getMyDevices(): Promise<DeviceDto[]> {
    const raw = await apiRequest<unknown>("/notifications/devices");
    if (Array.isArray(raw)) return raw as DeviceDto[];
    if (raw && typeof raw === "object" && Array.isArray((raw as any).devices)) {
      return (raw as any).devices;
    }
    return [];
  }

  /** DELETE /notifications/devices/:token — bỏ đăng ký khi logout. */
  async unregisterDevice(token: string): Promise<void> {
    await apiRequest(`/notifications/devices/${encodeURIComponent(token)}`, {
      method: "DELETE",
    });
  }
}

export const deviceService = new DeviceService();
