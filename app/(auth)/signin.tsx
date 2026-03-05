import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { LoginRequestDto } from '@/dtos';

export default function SignInScreen() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginRequestDto>({
    phoneNumber: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phoneNumber?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(formData);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đăng nhập thất bại');
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          {/* Title */}
          <Text variant="title" className="text-center mb-10">
            Login
          </Text>

          {/* Form */}
          <View className="gap-4">
            {/* Username/Phone Input */}
            <View>
              <Text variant="muted" className="mb-1">
                Username <Text className="text-red-500">*</Text>
              </Text>
              <Input
                placeholder="Nhập số điện thoại"
                value={formData.phoneNumber}
                onChangeText={(text) => updateField('phoneNumber', text)}
                keyboardType="phone-pad"
                autoCapitalize="none"
                error={errors.phoneNumber}
              />
            </View>

            {/* Password Input */}
            <View>
              <Text variant="muted" className="mb-1">
                Password <Text className="text-red-500">*</Text>
              </Text>
              <Input
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                secureTextEntry
                error={errors.password}
              />
            </View>

            {/* Sign In Button */}
            <Button onPress={handleSignIn} loading={loading} className="mt-4">
              Sign In
            </Button>

            {/* Forgot Password */}
            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity className="self-end">
                <Text variant="muted">Forgot password?</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-border-light dark:bg-border-dark" />
            <Text variant="muted" className="mx-4">
              Or
            </Text>
            <View className="flex-1 h-px bg-border-light dark:bg-border-dark" />
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center">
            <Text variant="muted">Do not have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="font-bold">Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}