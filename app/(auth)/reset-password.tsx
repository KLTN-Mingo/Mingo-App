import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';

import { SafeScreenView } from '@/components/containers/SafeLayout';
import { ActionInput, BackButton, Button, Text } from '@/components/ui';
import { authService } from '@/services/auth.service';
import { validateAuthFields } from '@/utils/authValidation';

type ResetErrors = {
  otp?: string;
  newPassword?: string;
  confirm?: string;
};

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ phoneNumber?: string }>();
  const phoneNumber = String(params.phoneNumber ?? '');

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ResetErrors>({});

  const validate = (): boolean => {
    const next = validateAuthFields(
      { otp, newPassword, confirm },
      {
        otp: {
          label: 'mã xác nhận',
          rules: ['required', 'otp'],
        },
        newPassword: {
          label: 'mật khẩu mới',
          rules: ['required', 'password'],
        },
        confirm: {
          label: 'xác nhận mật khẩu',
          rules: ['required', { type: 'confirmPassword', matchesField: 'newPassword' }],
        },
      }
    );

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!phoneNumber) {
      Alert.alert('Lỗi', 'Thiếu số điện thoại. Vui lòng quay lại bước trước.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        phoneNumber,
        otp: otp.trim(),
        newPassword,
      });
      Alert.alert(
        'Thành công',
        'Mật khẩu đã được đổi. Vui lòng đăng nhập lại.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/signin') }]
      );
    } catch (err: unknown) {
      console.error('[auth] reset password failed', err);
      Alert.alert(
        'Lỗi',
        err instanceof Error ? err.message : 'Không đổi được mật khẩu'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreenView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <BackButton />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          <Text variant="title" className="text-center mb-4">
            Reset Password
          </Text>

          <Text variant="muted" className="text-center mb-10">
            Nhập mã xác nhận đã gửi tới{' '}
            <Text className="font-semibold">{phoneNumber || '...'}</Text> và mật
            khẩu mới.
          </Text>

          <View className="gap-4">
            <ActionInput
              label="Mã xác nhận"
              isRequired
              variant="auth"
              placeholder="6 chữ số"
              value={otp}
              onChangeText={(t) => {
                setOtp(t);
                if (errors.otp)
                  setErrors((e) => ({ ...e, otp: undefined }));
              }}
              keyboardType="number-pad"
              maxLength={6}
              error={errors.otp}
            />

            <ActionInput
              label="Mật khẩu mới"
              isRequired
              variant="auth"
              placeholder="Ít nhất 6 ký tự"
              value={newPassword}
              onChangeText={(t) => {
                setNewPassword(t);
                if (errors.newPassword)
                  setErrors((e) => ({ ...e, newPassword: undefined }));
              }}
              secureTextEntry
              error={errors.newPassword}
            />

            <ActionInput
              label="Xác nhận mật khẩu"
              isRequired
              variant="auth"
              placeholder="Nhập lại mật khẩu"
              value={confirm}
              onChangeText={(t) => {
                setConfirm(t);
                if (errors.confirm)
                  setErrors((e) => ({ ...e, confirm: undefined }));
              }}
              secureTextEntry
              error={errors.confirm}
            />

            <Button onPress={handleSubmit} loading={loading} className="mt-4">
              Đổi mật khẩu
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreenView>
  );
}
