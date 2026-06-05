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
import { useOtpCooldown } from "@/hooks/use-otp-cooldown";
import { authService } from "@/services/auth.service";
import { validateAuthFields } from "@/utils/authValidation";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string; auto?: string }>();
  const initialEmail = String(params.email ?? "");

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [codeError, setCodeError] = useState<string | undefined>();
  const otpCooldown = useOtpCooldown(60);

  const validateEmail = () =>
    validateAuthFields(
      { email },
      {
        email: {
          label: "email",
          rules: ["required", "email"],
        },
      }
    );

  const validateVerifyForm = () =>
    validateAuthFields(
      { email, code },
      {
        email: {
          label: "email",
          rules: ["required", "email"],
        },
        code: {
          label: "mã xác nhận",
          rules: ["required", "otp"],
        },
      }
    );

  const handleResend = async () => {
    if (otpCooldown.isCoolingDown) return;

    const nextErrors = validateEmail();
    if (nextErrors.email) {
      setEmailError(nextErrors.email);
      return;
    }
    setResending(true);
    try {
      await authService.sendEmailVerification();
      Alert.alert(
        "Đã gửi mã",
        "Kiểm tra hộp thư email (và cả thư mục Spam)."
      );
      otpCooldown.startCooldown();
    } catch (err: unknown) {
      console.error("[auth] send email verification failed", err);
      Alert.alert(
        "Lỗi",
        err instanceof Error ? err.message : "Không gửi được mã"
      );
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const nextErrors = validateVerifyForm();
    setEmailError(nextErrors.email);
    setCodeError(nextErrors.code);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setLoading(true);
    try {
      await authService.verifyEmail({ email: email.trim(), code: code.trim() });
      Alert.alert("Thành công", "Email đã được xác nhận.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      console.error("[auth] verify email failed", err);
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
          className="px-6"
        >
          <Text variant="title" className="text-center mb-4">
            Xác nhận email
          </Text>

          <Text variant="muted" className="text-center mb-10">
            Chúng tôi sẽ gửi mã xác nhận tới địa chỉ email của bạn.
          </Text>

          <View className="gap-4">
            <ActionInput
              label="Email"
              isRequired
              variant="auth"
              placeholder="email@example.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailError) setEmailError(undefined);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              error={emailError}
            />

            <Button
              variant="outline"
              onPress={handleResend}
              disabled={otpCooldown.isCoolingDown}
              loading={resending}
            >
              {otpCooldown.label}
            </Button>

            <ActionInput
              label="Mã xác nhận"
              isRequired
              variant="auth"
              placeholder="6 chữ số"
              value={code}
              onChangeText={(t) => {
                setCode(t);
                if (codeError) setCodeError(undefined);
              }}
              keyboardType="number-pad"
              maxLength={6}
              error={codeError}
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
