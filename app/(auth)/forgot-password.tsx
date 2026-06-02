import { router } from "expo-router";
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
import { authService } from "@/services/auth.service";
import { validateAuthFields } from "@/utils/authValidation";

export default function ForgotPasswordScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = (): boolean => {
    const nextErrors = validateAuthFields(
      { phoneNumber },
      {
        phoneNumber: {
          label: "số điện thoại",
          rules: ["required", "phone"],
        },
      }
    );

    setError(nextErrors.phoneNumber ?? "");
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.forgotPassword({ phoneNumber });
      router.push({
        pathname: "/(auth)/reset-password" as never,
        params: { phoneNumber },
      } as never);
    } catch (err: unknown) {
      console.error("[auth] forgot password failed", err);
      Alert.alert(
        "Lỗi",
        err instanceof Error ? err.message : "Không gửi được mã xác nhận"
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
        <BackButton className="absolute left-0 top-0 z-10" />

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingTop: 10,
            paddingBottom: 100,
          }}
          keyboardShouldPersistTaps="handled"
          className=""
        >
          {/* Title */}
          <Text
            variant="title"
            className="text-title-light dark:text-title-dark text-[34px] leading-[44px] font-bold text-center mb-4"
          >
            Forgot Password
          </Text>

          <Text variant="muted" className="text-center mb-10">
            Enter your phone number and we will send you a code to reset your
            password
          </Text>

          {/* Form */}
          <View className="gap-4">
            <ActionInput
              label="Phone Number"
              isRequired
              variant="auth"
              placeholder="Nhập số điện thoại"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (error) setError("");
              }}
              keyboardType="phone-pad"
              error={error}
            />

            <Button onPress={handleSubmit} loading={loading} className="mt-4">
              Send Reset Code
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreenView>
  );
}
