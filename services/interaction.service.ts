import { Platform } from "react-native";

import {
  InteractionDevice,
  InteractionSource,
  TrackInteractionRequestDto,
} from "@/dtos";
import { apiRequest } from "@/services/api-client";

function detectDevice(): InteractionDevice {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}

function normalizeFeedSource(
  source?: InteractionSource
): InteractionSource | undefined {
  if (source === "friends") return "feed";
  return source;
}

class InteractionService {
  private inflight = new Set<string>();

  /**
   * POST /interactions/track — FE chỉ dùng trực tiếp cho view hợp lệ trong feed.
   *
   * Best-effort: lỗi không throw lên UI; chỉ log để tránh ảnh hưởng UX.
   */
  async track(payload: TrackInteractionRequestDto): Promise<void> {
    try {
      const source = normalizeFeedSource(payload.source);
      await apiRequest("/interactions/track", {
        method: "POST",
        body: JSON.stringify({
          deviceType: payload.deviceType ?? detectDevice(),
          ...payload,
          source,
        }),
      });
    } catch (err) {
      console.warn("[interaction] track failed", err);
    }
  }

  /** Chỉ track view 1 lần / post / session để tránh spam (in-memory). */
  trackOnce(payload: TrackInteractionRequestDto): void {
    const key = `${payload.type}:${payload.postId}:${
      normalizeFeedSource(payload.source) ?? ""
    }`;
    if (this.inflight.has(key)) return;
    this.inflight.add(key);
    this.track(payload).finally(() => {
      // Giữ key suốt session để không gọi lại — feed thường paginate, hiếm khi xem lại.
    });
  }

  trackView(
    postId: string,
    source: InteractionSource,
    extra?: { viewDuration?: number; scrollDepth?: number }
  ): void {
    this.trackOnce({
      postId,
      type: "view",
      source,
      viewDuration: extra?.viewDuration ?? 2,
      scrollDepth: extra?.scrollDepth ?? 0.6,
      ...extra,
    });
  }
}

export const interactionService = new InteractionService();
