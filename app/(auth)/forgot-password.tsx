import { router } from 'expo-router';
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
import { ArrowIcon } from '@/components/shared/icons/Icons';

export default function ForgotPasswordScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (): boolean => {
    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!/^[0-9]{10,11}$/.test(phoneNumber)) {
      setError('Số điện thoại không hợp lệ');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // TODO: Call API to send reset password OTP
      Alert.alert(
        'Thành công',
        'Mã xác nhận đã được gửi đến số điện thoại của bạn',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-4 py-2 flex-row items-center"
        >
          <ArrowIcon size={24} color="#768D85" />
          <Text className="ml-1 text-primary-400">Back</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          {/* Title */}
          <Text variant="title" className="text-center mb-4">
            Forgot Password
          </Text>

          <Text variant="muted" className="text-center mb-10">
            Enter your phone number and we'll send you a code to reset your
            password
          </Text>

          {/* Form */}
          <View className="gap-4">
            <View>
              <Text variant="muted" className="mb-1">
                Phone Number <Text className="text-red-500">*</Text>
              </Text>
              <Input
                placeholder="Nhập số điện thoại"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (error) setError('');
                }}
                keyboardType="phone-pad"
                error={error}
              />
            </View>

            <Button onPress={handleSubmit} loading={loading} className="mt-4">
              Send Reset Code
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}