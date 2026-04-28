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

import { ActionInput, Button, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { RegisterRequestDto } from '@/dtos';

interface SignUpFormData extends RegisterRequestDto {
  confirmPassword: string;
}

export default function SignUpScreen() {
  const { register } = useAuth();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
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
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đăng ký thất bại');
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
            Sign Up
          </Text>

          {/* Form */}
          <View className="gap-4">
            {/* Full Name Input */}
            <View>
              <Text variant="muted" className="mb-1">
                Full Name <Text className="text-red-500">*</Text>
              </Text>
              <ActionInput
                placeholder="Nhập họ tên"
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                autoCapitalize="words"
                error={errors.name}
              />
            </View>

            {/* Phone Input */}
            <View>
              <Text variant="muted" className="mb-1">
                Phone Number <Text className="text-red-500">*</Text>
              </Text>
              <ActionInput
                placeholder="Nhập số điện thoại"
                value={formData.phoneNumber}
                onChangeText={(text) => updateField('phoneNumber', text)}
                keyboardType="phone-pad"
                error={errors.phoneNumber}
              />
            </View>

            {/* Password Input */}
            <View>
              <Text variant="muted" className="mb-1">
                Password <Text className="text-red-500">*</Text>
              </Text>
              <ActionInput
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                secureTextEntry
                error={errors.password}
              />
            </View>

            {/* Confirm Password Input */}
            <View>
              <Text variant="muted" className="mb-1">
                Confirm Password <Text className="text-red-500">*</Text>
              </Text>
              <ActionInput
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChangeText={(text) => updateField('confirmPassword', text)}
                secureTextEntry
                error={errors.confirmPassword}
              />
            </View>

            {/* Sign Up Button */}
            <Button onPress={handleSignUp} loading={loading} className="mt-4">
              Sign Up
            </Button>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-border-light dark:bg-border-dark" />
            <Text variant="muted" className="mx-4">
              Or
            </Text>
            <View className="flex-1 h-px bg-border-light dark:bg-border-dark" />
          </View>

          {/* Sign In Link */}
          <View className="flex-row justify-center">
            <Text variant="muted">Already have an account? </Text>
            <Link href="/(auth)/signin" asChild>
              <TouchableOpacity>
                <Text className="font-bold">Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}