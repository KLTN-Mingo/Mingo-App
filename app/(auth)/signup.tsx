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
import { RegisterRequestDto } from "@/dtos";
import { paletteIcon } from "@/styles/colors";

const AUTH_BTN = "h-12 min-h-[48px] max-h-[48px] rounded-md py-0";

interface SignUpFormData extends RegisterRequestDto {
  confirmPassword: string;
}

export default function SignUpScreen() {
  const { register } = useAuth();
  const colorScheme = useColorScheme() ?? "dark";
  const iconMuted = paletteIcon[colorScheme === "dark" ? "dark" : "light"];

  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Đăng ký thất bại";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const passwordToggle = (visible: boolean, onToggle: () => void) => (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={visible ? "Hide password" : "Show password"}
    >
      <Ionicons
        name={visible ? "eye-off-outline" : "eye-outline"}
        size={20}
        color={iconMuted}
      />
    </Pressable>
  );

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
            className="text-center text-text-light dark:text-text-dark mb-2 text-[32px] leading-[44px] font-bold py-0.5"
            style={{ fontFamily: "Montserrat-Bold" }}
          >
            Sign up
          </Text>
          <Text
            variant="muted"
            className="text-center text-text-muted-light dark:text-text-muted-dark mb-10 lowercase"
          >
            create your new account
          </Text>

          <View className="gap-5">
            <View>
              <Text className="mb-2 text-base text-text-light dark:text-text-dark">
                Full Name
              </Text>
              <ActionInput
                variant="auth"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => updateField("name", text)}
                autoCapitalize="words"
                error={errors.name}
              />
            </View>

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
                rightIcon={passwordToggle(showPassword, () =>
                  setShowPassword((v) => !v)
                )}
              />
            </View>

            <View>
              <Text className="mb-2 text-base text-text-light dark:text-text-dark">
                Confirm Password
              </Text>
              <ActionInput
                variant="auth"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => updateField("confirmPassword", text)}
                secureTextEntry={!showConfirmPassword}
                error={errors.confirmPassword}
                rightIcon={passwordToggle(showConfirmPassword, () =>
                  setShowConfirmPassword((v) => !v)
                )}
              />
            </View>

            <Button
              onPress={handleSignUp}
              loading={loading}
              size="lg"
              className={`${AUTH_BTN} mt-1`}
            >
              Sign Up
            </Button>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert("Thông báo", "Đăng ký Google sẽ được hỗ trợ sau.")
              }
              className={`${AUTH_BTN} border border-border-light dark:border-border-dark flex-row items-center justify-center gap-2 px-6`}
            >
              <Ionicons name="logo-google" size={18} color={iconMuted} />
              <Text
                className="text-base font-medium text-text-light dark:text-text-dark text-center leading-5"
                style={{ lineHeight: 20 }}
              >
                Sign Up with Google
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-10">
            <Text variant="muted" className="text-sm">
              Already have an account?{" "}
            </Text>
            <Link href="/(auth)/signin" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-semibold text-text-light dark:text-text-dark">
                  Sign in
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
