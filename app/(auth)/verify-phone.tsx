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

export default function VerifyPhoneScreen() {
  const params = useLocalSearchParams<{ phoneNumber?: string }>();
  const initialPhone = String(params.phoneNumber ?? "");

  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [codeError, setCodeError] = useState<string | undefined>();
  const otpCooldown = useOtpCooldown(60);

  const validatePhone = () =>
    validateAuthFields(
      { phoneNumber },
      {
        phoneNumber: {
          label: "số điện thoại",
          rules: ["required", "phone"],
        },
      }
    );

  const validateVerifyForm = () =>
    validateAuthFields(
      { phoneNumber, code },
      {
        phoneNumber: {
          label: "số điện thoại",
          rules: ["required", "phone"],
        },
        code: {
          label: "mã OTP",
          rules: ["required", "otp"],
        },
      }
    );

  const handleResend = async () => {
    if (otpCooldown.isCoolingDown) return;

    const nextErrors = validatePhone();
    if (nextErrors.phoneNumber) {
      setPhoneError(nextErrors.phoneNumber);
      return;
    }
    setResending(true);
    try {
      await authService.sendPhoneOtp();
      Alert.alert("Đã gửi mã", "Vui lòng kiểm tra tin nhắn SMS.");
      otpCooldown.startCooldown();
    } catch (err: unknown) {
      console.error("[auth] send phone otp failed", err);
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
    setPhoneError(nextErrors.phoneNumber);
    setCodeError(nextErrors.code);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setLoading(true);
    try {
      await authService.verifyPhoneOtp({
        phoneNumber: phoneNumber.trim(),
        code: code.trim(),
      });
      Alert.alert("Thành công", "Số điện thoại đã được xác nhận.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      console.error("[auth] verify phone failed", err);
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
            Xác nhận số điện thoại
          </Text>

          <Text variant="muted" className="text-center mb-10">
            Chúng tôi sẽ gửi mã OTP qua tin nhắn SMS.
          </Text>

          <View className="gap-4">
            <ActionInput
              label="Số điện thoại"
              isRequired
              variant="auth"
              placeholder="0123456789"
              value={phoneNumber}
              onChangeText={(t) => {
                setPhoneNumber(t);
                if (phoneError) setPhoneError(undefined);
              }}
              keyboardType="phone-pad"
              error={phoneError}
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
              label="Mã OTP"
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
