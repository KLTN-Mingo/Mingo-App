import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { NotificationType } from "@/dtos";
import { deviceService } from "@/services/device.service";

// Khi app foreground, hiển thị banner + sound + badge.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn("[push] push only works on physical device");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      lightColor: "#FF231F7C",
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.warn("[push] permission not granted");
    return null;
  }

  try {
    const token = (
      await Notifications.getDevicePushTokenAsync()
    ).data;
    return typeof token === "string" ? token : null;
  } catch (err) {
    console.warn("[push] get device token failed", err);
    return null;
  }
}

/**
 * Đăng ký push token khi user login, deep-link khi tap notification.
 *
 * Cần build dev-client / production để chạy (Expo Go bị giới hạn từ SDK 53).
 * Behavior nhẹ nhàng: lỗi sẽ console.warn, không crash UX.
 */
export function usePushNotifications() {
  const { profile } = useAuth();
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;

    let cancelled = false;
    (async () => {
      const token = await registerForPushAsync();
      if (cancelled || !token) return;
      lastTokenRef.current = token;
      try {
        await deviceService.registerDevice({
          token,
          platform: Platform.OS === "ios" ? "ios" : "android",
        });
      } catch (err) {
        console.warn("[push] register device failed", err);
      }
    })();

    const respSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as
          | Record<string, unknown>
          | undefined;
        if (!data) return;
        handleDeepLink(data);
      }
    );

    return () => {
      cancelled = true;
      respSub.remove();
    };
  }, [profile?.id]);

  return {
    /** Token đã đăng ký — gọi khi logout để unregister. */
    deviceToken: lastTokenRef.current,
  };
}

function handleDeepLink(data: Record<string, unknown>) {
  const type = String(data.type ?? data.notificationType ?? "");
  const postId =
    typeof data.postId === "string"
      ? data.postId
      : typeof data.entityId === "string" &&
          String(data.entityType ?? "") === "post"
        ? data.entityId
        : undefined;
  const userId =
    typeof data.userId === "string"
      ? data.userId
      : typeof data.actorId === "string"
        ? data.actorId
        : undefined;
  const boxId =
    typeof data.boxId === "string"
      ? data.boxId
      : typeof data.entityId === "string" &&
          String(data.entityType ?? "") === "message"
        ? data.entityId
        : undefined;

  switch (type) {
    case NotificationType.POST_LIKE:
    case NotificationType.POST_COMMENT:
    case NotificationType.POST_SHARE:
    case NotificationType.POST_MENTION:
    case NotificationType.COMMENT_LIKE:
    case NotificationType.COMMENT_REPLY:
    case NotificationType.COMMENT_MENTION:
      if (postId) router.push(`/post/${postId}` as any);
      break;
    case NotificationType.FOLLOW_REQUEST:
    case NotificationType.FOLLOW_ACCEPTED:
    case NotificationType.FOLLOW_NEW:
    case NotificationType.CLOSE_FRIEND_REQUEST:
    case NotificationType.CLOSE_FRIEND_ACCEPTED:
      if (userId) router.push(`/profile/${userId}` as any);
      break;
    case NotificationType.MESSAGE_NEW:
      if (boxId) router.push(`/chat/${boxId}` as any);
      else router.push("/chat" as any);
      break;
    default:
      break;
  }
}
