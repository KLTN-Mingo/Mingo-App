import { router } from "expo-router";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

import { ArrowIcon } from "@/components/shared/icons/Icons";
import { getSemantic } from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";
import { Text } from "./Text";

type BackButtonProps = Omit<TouchableOpacityProps, "onPress"> & {
  onPress?: () => void;
};

export function BackButton({
  onPress,
  className = "",
  ...props
}: BackButtonProps) {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");

  return (
    <TouchableOpacity
      onPress={onPress ?? (() => router.back())}
      className={`px-4 py-2 flex-row items-center ${className}`}
      {...props}
    >
      <ArrowIcon size={35} color={sem.title} />
      <Text className="ml-1 text-xl font-semibold leading-[28px] text-title-light dark:text-title-dark">
        Back
      </Text>
    </TouchableOpacity>
  );
}
