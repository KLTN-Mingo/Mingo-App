import { colors, paletteIcon } from "@/styles/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { twMerge } from "tailwind-merge";
import { Text } from "./Text";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Primary: #768D85 | Secondary outlined pill | Ghost: transparent */
const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary active:opacity-90",
  secondary:
    "bg-transparent border border-pill-light dark:border-pill-dark active:opacity-80",
  outline:
    "bg-transparent border border-pill-light dark:border-pill-dark active:opacity-80",
  ghost:
    "bg-transparent active:bg-surface-light dark:active:bg-surface-dark",
  danger: "bg-danger-light dark:bg-danger-dark active:opacity-80",
};

const textVariantClasses: Record<ButtonVariant, string> = {
  primary: "text-white font-semibold",
  secondary: "text-text-light dark:text-text-dark font-medium",
  outline: "text-text-light dark:text-text-dark font-medium",
  ghost: "text-primary font-medium",
  danger: "text-white font-semibold",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-6 py-2.5 min-h-[36px]",
  md: "px-6 py-2.5 min-h-[40px]",
  lg: "px-6 py-3 min-h-[48px]",
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <TouchableOpacity
      className={twMerge(
        `items-center justify-center rounded-full gap-2 self-stretch ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || loading ? "opacity-50" : ""} ${className}`,
      )}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" ? "#FFFFFF" : paletteIcon[colorScheme]}
        />
      ) : (
        <Text className={`${textVariantClasses[variant]} ${textSizeClasses[size]}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
