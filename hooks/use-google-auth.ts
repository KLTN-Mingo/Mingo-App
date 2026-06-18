import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";

import { authService } from "@/services/auth.service";

WebBrowser.maybeCompleteAuthSession();

interface UseGoogleAuthOptions {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

interface UseGoogleAuthResult {
  /** True khi đang đợi user pick account hoặc đang gọi BE. */
  loading: boolean;
  /** Đã sẵn sàng dùng (config OAuth ok). */
  ready: boolean;
  /** Gọi để bắt đầu flow Google Sign-In. */
  signIn: () => Promise<void>;
}

/**
 * Hook Google Sign-In dùng `expo-auth-session/providers/google`.
 *
 * ENV cần set trước khi build:
 *  - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
 *  - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
 *  - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
 *
 * Sau khi user pick Google account → nhận `idToken` → gửi cho BE qua
 * `authService.googleLogin(idToken)`. BE sẽ tạo/đăng nhập user và trả về
 * `accessToken` thông thường.
 */
export function useGoogleAuth(
  options: UseGoogleAuthOptions = {}
): UseGoogleAuthResult {
  const [exchanging, setExchanging] = useState(false);

  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
  });

  const ready =
    !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    !!process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    !!process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  useEffect(() => {
    if (!response) return;
    if (response.type !== "success") {
      if (response.type === "error") {
        options.onError?.(response.error);
      }
      return;
    }

    const idToken = response.params?.id_token;
    if (!idToken) {
      options.onError?.(new Error("No idToken received from Google"));
      return;
    }

    let cancelled = false;
    (async () => {
      setExchanging(true);
      try {
        await authService.googleLogin(idToken);
        if (!cancelled) options.onSuccess?.();
      } catch (err) {
        if (!cancelled) options.onError?.(err);
      } finally {
        if (!cancelled) setExchanging(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [response, options]);

  const signIn = useCallback(async () => {
    await promptAsync();
  }, [promptAsync]);

  return {
    loading: exchanging,
    ready,
    signIn,
  };
}
