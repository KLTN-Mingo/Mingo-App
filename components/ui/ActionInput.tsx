import { getSemantic } from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";
import { ReactNode } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { Text } from "./Text";

export interface ActionInputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  leftIcon?: ReactNode;
  /** `component` = nền #F1F4F3 / #2D2F2F (ô tìm kiếm, v.v.) */
  surface?: "input" | "component";
}

/** Ô nhập dạng “hành động” (pill, icon): đăng nhập, tìm kiếm danh sách, v.v. */
export function ActionInput({
  label,
  error,
  className = "",
  leftIcon,
  surface = "input",
  ...props
}: ActionInputProps) {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");
  const rowBg =
    surface === "component"
      ? "bg-component-light dark:bg-component-dark"
      : "bg-input-light dark:bg-input-dark";

  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-2 font-medium text-base text-text-light dark:text-text-dark">
          {label}
        </Text>
      ) : null}
      <View
        className={`flex-row items-center w-full px-4 py-4 rounded-[20px]
          ${rowBg} ${className}`}
        style={{ borderWidth: 0 }}
      >
        {leftIcon ? <View className="mr-3">{leftIcon}</View> : null}
        <TextInput
          className="flex-1 py-0 font-regular text-base
            text-text-light dark:text-text-dark"
          underlineColorAndroid="transparent"
          style={{ borderWidth: 0 }}
          placeholderTextColor={sem.placeholder}
          {...props}
        />
      </View>
      {error ? (
        <Text className="mt-1 text-sm text-error-light dark:text-error-dark">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
