import { TextInput, TextInputProps, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getSemantic } from "@/constants/designTokens";
import { Text } from "./Text";

interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  rows?: number;
  className?: string;
}

export function TextArea({
  label,
  error,
  rows = 4,
  className = "",
  ...props
}: TextAreaProps) {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");

  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-2 font-medium text-text-light dark:text-text-dark">
          {label}
        </Text>
      ) : null}
      <TextInput
        multiline
        numberOfLines={rows}
        textAlignVertical="top"
        className={`w-full px-4 py-3 rounded-xl border font-regular text-base
          bg-input-light dark:bg-input-dark
          text-text-light dark:text-text-dark
          border-border-light dark:border-border-dark
          min-h-[100px]
          ${error ? "border-error-light dark:border-error-dark" : ""}
          ${className}`}
        placeholderTextColor={sem.placeholder}
        {...props}
      />
      {error ? (
        <Text className="mt-1 text-sm text-error-light dark:text-error-dark">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
