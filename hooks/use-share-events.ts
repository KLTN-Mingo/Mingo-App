import { useEffect, useRef } from "react";

import type { ShareNotificationPayload, ShareNotificationType } from "@/dtos";
import { subscribeShareEvents } from "@/services/notification-socket.service";

type Handler = (payload: ShareNotificationPayload) => void;

interface UseShareEventsOptions {
  /** Lọc theo type (`dm_share` / `repost`). Bỏ qua nếu không set. */
  type?: ShareNotificationType;
  /** Lọc theo postId — vd. trong post detail chỉ care event của post đó. */
  postId?: string;
  /** Lọc theo recipientId — vd. profile trang chủ chỉ nhận của mình. */
  recipientId?: string;
}

/**
 * Subscribe các event share realtime (`new_dm_share` + `new_repost`) đã được
 * dedupe sẵn trong socket service. Handler được lưu qua ref để khỏi resubscribe
 * mỗi lần re-render.
 */
export function useShareEvents(
  handler: Handler,
  options: UseShareEventsOptions = {}
) {
  const handlerRef = useRef<Handler>(handler);
  handlerRef.current = handler;

  const { type, postId, recipientId } = options;

  useEffect(() => {
    return subscribeShareEvents((payload) => {
      if (type && payload.type !== type) return;
      if (postId && payload.postId !== postId) return;
      if (recipientId && payload.recipientId !== recipientId) return;
      handlerRef.current(payload);
    });
  }, [type, postId, recipientId]);
}
