import { getSemantic } from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";
import { ReactNode } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { Text } from "./Text";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  leftIcon?: ReactNode;
}

export function Input({
  label,
  error,
  className = "",
  leftIcon,
  ...props
}: InputProps) {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");

  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-2 font-medium text-base text-text-light dark:text-text-dark">
          {label}
        </Text>
      ) : null}
      <View
        className={`flex-row items-center w-full px-4 py-4 rounded-[20px]
          bg-input-light dark:bg-input-dark ${className}`}
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
