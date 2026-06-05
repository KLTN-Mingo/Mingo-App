import React from "react";
import { Platform, ViewProps } from "react-native";

import { SafeScreenView } from "@/components/containers/SafeLayout";

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  horizontalPadding?: "default" | "compact" | "none";
  bottomPadding?: "default" | "none";
  includeBottomInset?: boolean;
}

export function ScreenContainer({
  children,
  className = "",
  style,
  horizontalPadding = "default",
  bottomPadding = "default",
  includeBottomInset = false,
  ...props
}: ScreenContainerProps) {
  const horizontal =
    horizontalPadding === "none"
      ? 0
      : horizontalPadding === "compact"
        ? Platform.select({ ios: 16, android: 14, default: 12 })
        : Platform.select({ ios: 20, android: 16, default: 12 });

  const bottom =
    bottomPadding === "none"
      ? 0
      : Platform.select({ ios: 28, android: 24, default: 24 });

  return (
    <SafeScreenView
      className={`flex-1 bg-background-light dark:bg-background-dark ${className}`}
      includeBottom={includeBottomInset}
      {...props}
      style={[
        {
          paddingHorizontal: horizontal,
          paddingBottom: bottom,
        },
        style,
      ]}
    >
      {children}
    </SafeScreenView>
  );
}
