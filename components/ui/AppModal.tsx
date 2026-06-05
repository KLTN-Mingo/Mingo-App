// Refactored: added animated tokenized modal shell with blurred-feeling backdrop surface.
import type { ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from "react-native-reanimated";
import { twMerge } from "tailwind-merge";

import { SafeModalSheet } from "@/components/containers/SafeLayout";
import { uiStrings } from "@/src/constants/strings";

interface AppModalProps {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
  className?: string;
}

export function AppModal({ visible, onDismiss, children, className }: AppModalProps) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <View className="flex-1 justify-end">
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          className="absolute inset-0 bg-background-dark/60"
        >
          <Pressable
            className="flex-1"
            onPress={onDismiss}
            accessibilityLabel={uiStrings.dismissModalLabel}
            accessibilityRole="button"
          />
        </Animated.View>
        <Animated.View
          entering={SlideInUp.springify()}
          exiting={SlideOutDown}
        >
          <SafeModalSheet
            className={twMerge(
              "rounded-t-4xl bg-sheet-light px-xl pb-xxl pt-md dark:bg-sheet-dark",
              className
            )}
          >
          <View className="mb-lg self-center rounded-full bg-border-light dark:bg-border-dark h-1 w-12" />
          {children}
          </SafeModalSheet>
        </Animated.View>
      </View>
    </Modal>
  );
}
