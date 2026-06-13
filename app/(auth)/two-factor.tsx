import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

import { SafeScreenView } from "@/components/containers/SafeLayout";
import { ActionInput, BackButton, Button, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { validateAuthFields } from "@/utils/authValidation";
import { profileFromCompletedTwoFactorLogin } from "@/utils/twoFactorLoginProfile";

/**
 * Bước 2 khi login user đã bật 2FA.
 *
 * BE trả `requiresTwoFactor: true, pendingToken` khi login OK + 2FA enabled.
 * Screen này nhận `pendingToken` qua route param và gọi
 * `authService.complete2FALogin({ pendingToken, code })`.
 */
export default function TwoFactorScreen() {
  const params = useLocalSearchParams<{ pendingToken?: string }>();
  const pendingToken = String(params.pendingToken ?? "");
  const { setProfile } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleVerify = async () => {
    const nextErrors = validateAuthFields(
      { code },
      {
        code: {
          label: "mã xác thực",
          rules: ["required", "otp"],
        },
      }
    );

    setError(nextErrors.code);
    if (nextErrors.code) {
      return;
    }
    if (!pendingToken) {
      Alert.alert("Phiên xác thực hết hạn", "Vui lòng đăng nhập lại.", [
        { text: "OK", onPress: () => router.replace("/(auth)/signin") },
      ]);
      return;
    }
    setLoading(true);
    try {
      const data = await authService.complete2FALogin({
        pendingToken,
        code: code.trim(),
      });
      const nextProfile = profileFromCompletedTwoFactorLogin(data);
      if (nextProfile) {
        // AuthContext sẽ rehydrate qua AsyncStorage trên màn signin? Đơn giản:
        // chuyển về tab chính, AuthContext listener đọc lại token.
        setProfile(nextProfile);
        router.replace("/(tabs)/home" as never);
      } else {
        Alert.alert("Lỗi", "Không nhận được token");
      }
    } catch (err: unknown) {
      console.error("[auth] 2fa complete failed", err);
      Alert.alert(
        "Lỗi",
        err instanceof Error ? err.message : "Mã không hợp lệ"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreenView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <BackButton />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          className="px-6 mb-40"
        >
          <Text
            variant="title"
            className="text-center mb-4 text-title-light dark:text-title-dark"
          >
            Two-Factor Authentication
          </Text>

          <Text variant="muted" className="text-center mb-10">
            Mở ứng dụng Authenticator của bạn và nhập mã 6 chữ số.
          </Text>

          <View className="gap-4">
            <ActionInput
              label="Mã xác thực"
              isRequired
              variant="auth"
              placeholder="000 000"
              value={code}
              onChangeText={(t) => {
                setCode(t);
                if (error) setError(undefined);
              }}
              keyboardType="number-pad"
              maxLength={6}
              error={error}
            />

            <Button onPress={handleVerify} loading={loading} className="mt-2">
              Xác nhận
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreenView>
  );
}
