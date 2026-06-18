import { getSemantic } from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";
import { forwardRef, ReactNode } from "react";
import { Platform, TextInput, TextInputProps, View } from "react-native";
import { Text } from "./Text";

export const AUTH_CONTROL_HEIGHT = 48;
export const AUTH_CONTROL_RADIUS = 12;
const AUTH_FONT_SIZE = 14;

export interface ActionInputProps extends TextInputProps {
  label?: string;
  isRequired?: boolean;
  error?: string;
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  surface?: "input" | "component";
  variant?: "default" | "auth";
}

export const ActionInput = forwardRef<TextInput, ActionInputProps>(
  function ActionInput(
    {
      label,
      isRequired = false,
      error,
      className = "",
      leftIcon,
      rightIcon,
      surface = "input",
      variant = "default",
      style,
      textAlign,
      ...props
    },
    ref
  ) {
    const { colorScheme } = useTheme();
    const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");
    const isAuth = variant === "auth";
    const rowBg = "bg-surface-muted-light dark:bg-surface-muted-dark";

    const rowClass = isAuth
      ? `flex-row items-center w-full px-4 rounded-xl border border-border-light dark:border-border-dark bg-transparent ${className}`
      : `flex-row items-center px-4 py-4 rounded-lg w-full ${rowBg} ${className}`;

    return (
      <View className="w-full">
        {label ? (
          <Text className="mb-2 font-medium text-sm text-text-light dark:text-text-dark">
            {label}
            {isRequired ? (
              <Text className="text-title-light dark:text-title-dark"> *</Text>
            ) : null}
          </Text>
        ) : null}
        <View
          className={rowClass}
          style={
            isAuth
              ? {
                  height: AUTH_CONTROL_HEIGHT,
                  borderRadius: AUTH_CONTROL_RADIUS,
                  borderColor: error ? sem.danger : sem.border,
                }
              : undefined
          }
        >
          {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
          <TextInput
            ref={ref}
            className="flex-1 font-regular text-text-light dark:text-text-dark"
            underlineColorAndroid="transparent"
            style={[
              {
                borderWidth: 0,
                margin: 0,
                paddingHorizontal: 0,
                fontSize: AUTH_FONT_SIZE,
                ...(isAuth
                  ? Platform.select({
                      ios: {
                        height: AUTH_CONTROL_HEIGHT,
                        paddingTop: 0,
                        paddingBottom: 0,
                      },
                      android: {
                        height: AUTH_CONTROL_HEIGHT,
                        lineHeight: AUTH_FONT_SIZE,
                        paddingVertical: 0,
                        textAlignVertical: "center",
                        includeFontPadding: false,
                      },
                      default: {
                        height: AUTH_CONTROL_HEIGHT,
                        paddingVertical: 0,
                      },
                    })
                  : { paddingVertical: 0 }),
              },
              style,
            ]}
            textAlign={textAlign ?? "left"}
            placeholderTextColor={sem.placeholder}
            {...props}
          />
          {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
        </View>
        {error ? (
          <Text className="mt-1 text-sm font-medium" style={{ color: sem.danger }}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  }
);
