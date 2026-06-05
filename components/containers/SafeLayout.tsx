import type { ReactNode } from "react";
import { View, type ViewProps, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { twMerge } from "tailwind-merge";

import { layoutSpacing, spacing } from "@/constants/designTokens";

type SafeScreenViewProps = ViewProps & {
  children: ReactNode;
  className?: string;
  includeBottom?: boolean;
};

type SafeModalSheetProps = ViewProps & {
  children: ReactNode;
  className?: string;
  minHeight?: number | `${number}%`;
};

export function useSafeLayoutMetrics() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const screenTop = insets.top + spacing.sm;
  const screenBottom = insets.bottom + layoutSpacing.contentBottom;
  const modalMaxHeight = height - insets.top - layoutSpacing.modalTopGap;

  return {
    insets,
    modalMaxHeight,
    screenBottom,
    screenTop,
  };
}

export function SafeScreenView({
  children,
  className,
  includeBottom = false,
  style,
  ...props
}: SafeScreenViewProps) {
  const { screenBottom, screenTop } = useSafeLayoutMetrics();

  return (
    <View
      className={twMerge(
        "flex-1 bg-background-light dark:bg-background-dark",
        className
      )}
      style={[
        {
          paddingBottom: includeBottom ? screenBottom : undefined,
          paddingTop: screenTop,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export function SafeModalSheet({
  children,
  className,
  minHeight,
  style,
  ...props
}: SafeModalSheetProps) {
  const { modalMaxHeight } = useSafeLayoutMetrics();

  return (
    <View
      className={twMerge(
        "rounded-t-[20px] bg-background-light px-4 pb-6 pt-4 dark:bg-background-dark",
        className
      )}
      style={[{ maxHeight: modalMaxHeight, minHeight }, style]}
      {...props}
    >
      {children}
    </View>
  );
}
