import { getSemantic } from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";
import { ReactNode } from "react";
import { Platform, TextInput, TextInputProps, View } from "react-native";
import { Text } from "./Text";

/** Auth: cao 48px, bo góc 12px — khớp tailwind `rounded-md` */
export const AUTH_CONTROL_HEIGHT = 48;
export const AUTH_CONTROL_RADIUS = 12;
const AUTH_FONT_SIZE = 16;
const AUTH_LINE_HEIGHT = 20;
const AUTH_IOS_V_PAD = (AUTH_CONTROL_HEIGHT - AUTH_LINE_HEIGHT) / 2;

export interface ActionInputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** `component` = nền #F1F4F3 / #2D2F2F (ô tìm kiếm, v.v.) */
  surface?: "input" | "component";
  /** Auth forms: h-48px, bo 12px, viền, chữ căn giữa theo chiều dọc */
  variant?: "default" | "auth";
}

/** Ô nhập dạng “hành động” (pill, icon): đăng nhập, tìm kiếm danh sách, v.v. */
export function ActionInput({
  label,
  error,
  className = "",
  leftIcon,
  rightIcon,
  surface = "input",
  variant = "default",
  style,
  textAlign,
  ...props
}: ActionInputProps) {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");
  const isAuth = variant === "auth";
  const rowBg =
    surface === "component"
      ? "bg-component-light dark:bg-component-dark"
      : "bg-input-light dark:bg-input-dark";

  const rowClass = isAuth
    ? `flex-row items-center w-full px-4 rounded-md border border-border-light dark:border-border-dark bg-transparent ${className}`
    : `flex-row items-center px-4 py-4 rounded-[20px] w-full ${rowBg} ${className}`;

  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-2 font-medium text-base text-text-light dark:text-text-dark">
          {label}
        </Text>
      ) : null}
      <View
        className={rowClass}
        style={
          isAuth
            ? { height: AUTH_CONTROL_HEIGHT, borderRadius: AUTH_CONTROL_RADIUS }
            : undefined
        }
      >
        {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
        <TextInput
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
                      lineHeight: AUTH_LINE_HEIGHT,
                      paddingTop: AUTH_IOS_V_PAD,
                      paddingBottom: AUTH_IOS_V_PAD,
                    },
                    android: {
                      height: AUTH_CONTROL_HEIGHT,
                      lineHeight: AUTH_LINE_HEIGHT,
                      paddingVertical: 0,
                      textAlignVertical: "center",
                      includeFontPadding: false,
                    },
                    default: {
                      lineHeight: AUTH_LINE_HEIGHT,
                      paddingVertical: AUTH_IOS_V_PAD,
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
        <Text className="mt-1 text-sm text-error-light dark:text-error-dark">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
