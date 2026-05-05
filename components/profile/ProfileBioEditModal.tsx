import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
} from "react-native";

import { Button, Text, TextArea } from "@/components/ui";

export type ProfileBioEditModalProps = {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  saving: boolean;
  onRequestClose: () => void;
  onCancel: () => void;
  onSave: () => void;
};

export function ProfileBioEditModal({
  visible,
  value,
  onChangeText,
  saving,
  onRequestClose,
  onCancel,
  onSave,
}: ProfileBioEditModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onRequestClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={() => {
            if (!saving) onCancel();
          }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="bg-background-light dark:bg-background-dark rounded-t-3xl px-4 pt-2 pb-8">
            <View className="items-center py-2">
              <View className="w-10 h-1 bg-border-light dark:bg-border-dark rounded-full" />
            </View>
            <Text className="text-center font-semibold text-lg mb-3 text-text-light dark:text-text-dark">
              Giới thiệu
            </Text>
            <TextArea
              value={value}
              onChangeText={onChangeText}
              placeholder="Viết giới thiệu... (tối đa 500 ký tự)"
              rows={6}
              maxLength={500}
            />
            <View className="flex-row gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onPress={onCancel}
                disabled={saving}
              >
                Hủy
              </Button>
              <Button
                className="flex-1"
                onPress={onSave}
                loading={saving}
                disabled={saving}
              >
                Lưu
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
