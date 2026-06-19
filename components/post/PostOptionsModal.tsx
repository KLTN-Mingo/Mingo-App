import React from "react";
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from "react-native";

import { Text } from "@/components/ui";
import { paletteDark, paletteLight } from "@/constants/designTokens";

export interface PostOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  icon?: React.ReactNode;
}

interface PostOptionsModalProps {
  visible: boolean;
  options: PostOption[];
  onClose: () => void;
}

export function PostOptionsModal({
  visible,
  options,
  onClose,
}: PostOptionsModalProps) {
  const isDark = useColorScheme() === "dark";
  const colors = isDark ? paletteDark : paletteLight;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          {/* Sheet — TouchableWithoutFeedback không lan xuống đây */}
          <TouchableWithoutFeedback>
            <View
              className="rounded-t-2xl overflow-hidden pb-8"
              style={{ backgroundColor: colors.surface }}
            >
              {/* Handle bar */}
              <View className="items-center pt-3 pb-2">
                <View
                  className="w-10 h-1 rounded-full"
                  style={{ backgroundColor: colors.border }}
                />
              </View>

              {options.map((opt, idx) => (
                <React.Fragment key={opt.label}>
                  {idx > 0 && (
                    <View
                      className="mx-4"
                      style={{ height: 1, backgroundColor: colors.border }}
                    />
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      // Delay nhỏ để modal đóng trước khi action chạy
                      setTimeout(opt.onPress, 200);
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-3 px-5 py-4"
                  >
                    {opt.icon && (
                      <View className="w-5 items-center">{opt.icon}</View>
                    )}
                    <Text
                      className="text-base"
                      style={{
                        color: opt.destructive ? "#EF4444" : colors.textPrimary,
                        fontWeight: opt.destructive ? "600" : "400",
                      }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}

              {/* Cancel button */}
              <View className="mx-4 mt-2">
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  className="py-4 rounded-xl items-center"
                  style={{ backgroundColor: colors.surfaceMuted }}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: colors.textPrimary }}
                  >
                    Huỷ
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
