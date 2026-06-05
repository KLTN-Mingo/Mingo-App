// Refactored: added animated floating-label input with focus, error, and password states.
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { twMerge } from "tailwind-merge";

import { getSemantic } from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";
import { uiStrings } from "@/src/constants/strings";
import { timing } from "@/src/theme/animations";
import { Text } from "./Text";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isPassword?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  maxLength?: number;
};

const LABEL_FOCUSED_TOP = -10;
const LABEL_REST_TOP = 14;
const LABEL_REST_SCALE = 1;
const LABEL_FOCUSED_SCALE = 0.82;
const ERROR_SHAKE_DISTANCE = 8;
const ERROR_SHAKE_DURATION = timing.fast / 2;

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isPassword,
  containerClassName,
  inputClassName,
  value,
  onFocus,
  onBlur,
  onChangeText,
  multiline,
  maxLength,
  secureTextEntry,
  accessibilityLabel,
  ...props
}: InputProps) {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const filled = Boolean(String(value ?? "").length);
  const active = focused || filled;
  const progress = useSharedValue(active ? 1 : 0);
  const borderWidth = useSharedValue(focused ? 2 : 1);
  const shake = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: timing.fast });
    borderWidth.value = withTiming(focused ? 2 : 1, { duration: timing.fast });
  }, [active, borderWidth, focused, progress]);

  useEffect(() => {
    if (!error) return;
    shake.value = withSequence(
      withTiming(-ERROR_SHAKE_DISTANCE, { duration: ERROR_SHAKE_DURATION }),
      withTiming(ERROR_SHAKE_DISTANCE, { duration: ERROR_SHAKE_DURATION }),
      withTiming(0, { duration: ERROR_SHAKE_DURATION })
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
      () => undefined
    );
  }, [error, shake]);

  const labelStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [LABEL_REST_TOP, LABEL_FOCUSED_TOP]),
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, -4]) },
      { scale: interpolate(progress.value, [0, 1], [LABEL_REST_SCALE, LABEL_FOCUSED_SCALE]) },
    ],
  }));

  const shellStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
    borderColor: error ? sem.danger : focused ? sem.primary : sem.border,
    transform: [{ translateX: shake.value }],
  }));

  const counter = useMemo(() => {
    if (!multiline || !maxLength) return null;
    return `${String(value ?? "").length}/${maxLength}`;
  }, [maxLength, multiline, value]);

  const handleFocus: NonNullable<TextInputProps["onFocus"]> = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur: NonNullable<TextInputProps["onBlur"]> = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <View className={twMerge("w-full", containerClassName)}>
      <Animated.View
        className="relative min-h-14 flex-row items-center rounded-md bg-input-light px-lg dark:bg-input-dark"
        style={shellStyle}
      >
        <Animated.View
          className="absolute left-lg z-10 bg-input-light px-xs dark:bg-input-dark"
          pointerEvents="none"
          style={labelStyle}
        >
          <Text className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
            {label}
          </Text>
        </Animated.View>

        {leftIcon ? <View className="mr-sm min-h-11 justify-center">{leftIcon}</View> : null}
        <TextInput
          className={twMerge(
            "min-h-11 flex-1 pt-lg font-regular text-base text-text-light dark:text-text-dark",
            multiline ? "py-lg" : "",
            inputClassName
          )}
          multiline={multiline}
          placeholderTextColor={sem.placeholder}
          secureTextEntry={isPassword ? !passwordVisible : secureTextEntry}
          value={value}
          onBlur={handleBlur}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          maxLength={maxLength}
          accessibilityLabel={accessibilityLabel ?? label}
          {...props}
        />
        {isPassword ? (
          <Pressable
            className="ml-sm h-11 w-11 items-center justify-center rounded-full"
            onPress={() => {
              setPasswordVisible((current) => !current);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => undefined
              );
            }}
            accessibilityLabel={
              passwordVisible
                ? uiStrings.hidePasswordLabel
                : uiStrings.showPasswordLabel
            }
            accessibilityRole="button"
          >
            <Ionicons
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={sem.iconMuted}
            />
          </Pressable>
        ) : rightIcon ? (
          <View className="ml-sm min-h-11 justify-center">{rightIcon}</View>
        ) : null}
      </Animated.View>

      <View className="mt-xs flex-row items-center justify-between">
        <Text
          className={twMerge(
            "text-sm font-medium",
            error
              ? "text-danger-light dark:text-danger-dark"
              : "text-text-secondary-light dark:text-text-secondary-dark"
          )}
        >
          {error ?? helperText ?? ""}
        </Text>
        {counter ? (
          <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
            {counter}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
