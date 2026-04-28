import React from "react";
import { View, ViewProps } from "react-native";

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
}

export function ScreenContainer({
  children,
  className = "",
  ...props
}: ScreenContainerProps) {
  return (
    <View className={`py-7 px-5  flex-1 bg-background-light dark:bg-background-dark  ${className}`} {...props}>
      {children}
    </View>
  );
}
