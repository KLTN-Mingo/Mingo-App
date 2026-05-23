import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionInput, Button, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LoginRequestDto } from "@/dtos";
import { paletteIcon } from "@/styles/colors";

/** h-48 + bo 12px (`rounded-md` trong tailwind.config) */
const AUTH_BTN = "h-12 min-h-[48px] max-h-[48px] rounded-md py-0";

export default function SignInScreen() {
  const { login } = useAuth();
  const colorScheme = useColorScheme() ?? "dark";
  const iconMuted = paletteIcon[colorScheme === "dark" ? "dark" : "light"];

  const [formData, setFormData] = useState<LoginRequestDto>({
    phoneNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ phoneNumber?: string; password?: string }>(
    {}
  );

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(formData);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Đăng nhập thất bại";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof LoginRequestDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            className="text-center text-text-light dark:text-text-dark mb-3 text-[32px] leading-[44px] font-bold py-0.5"
            style={{ fontFamily: "Montserrat-Bold" }}
          >
            Welcome Back!
          </Text>
          <Text
            variant="muted"
            className="text-center text-text-muted-light dark:text-text-muted-dark mb-10 px-2 leading-5"
          >
            Enter your phone number and password to access your account
          </Text>

          <View className="gap-5">
            <View>
              <Text className="mb-2 text-base text-text-light dark:text-text-dark">
                Phone Number
              </Text>
              <ActionInput
                variant="auth"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChangeText={(text) => updateField("phoneNumber", text)}
                keyboardType="phone-pad"
                autoCapitalize="none"
                error={errors.phoneNumber}
              />
            </View>

            <View>
              <Text className="mb-2 text-base text-text-light dark:text-text-dark">
                Password
              </Text>
              <ActionInput
                variant="auth"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) => updateField("password", text)}
                secureTextEntry={!showPassword}
                error={errors.password}
                rightIcon={
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={iconMuted}
                    />
                  </Pressable>
                }
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => setRememberMe((v) => !v)}
                className="flex-row items-center gap-2"
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberMe }}
              >
                <View
                  className={`w-5 h-5 rounded border items-center justify-center ${
                    rememberMe
                      ? "bg-primary border-primary"
                      : "border-border-light dark:border-border-dark"
                  }`}
                >
                  {rememberMe ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : null}
                </View>
                <Text className="text-sm text-text-light dark:text-text-dark">
                  Remember me
                </Text>
              </Pressable>

              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity>
                  <Text className="text-sm text-text-light dark:text-text-dark">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            <Button
              onPress={handleSignIn}
              loading={loading}
              size="lg"
              className={`${AUTH_BTN} mt-1`}
            >
              Sign In
            </Button>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert("Thông báo", "Đăng nhập Google sẽ được hỗ trợ sau.")
              }
              className={`${AUTH_BTN} border border-border-light dark:border-border-dark flex-row items-center justify-center gap-2 px-6`}
            >
              <Ionicons name="logo-google" size={18} color={iconMuted} />
              <Text
                className="text-base font-medium text-text-light dark:text-text-dark text-center leading-5"
                style={{ lineHeight: 20 }}
              >
                Sign In with Google
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-10">
            <Text variant="muted" className="text-sm">
              Don&apos;t you have an account?{" "}
            </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-semibold text-text-light dark:text-text-dark">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
