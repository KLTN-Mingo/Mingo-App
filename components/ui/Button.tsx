import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { Text } from "./Text";
import { colors } from "@/styles/colors";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-100 active:opacity-90",
  secondary:
    "bg-surface-muted-light dark:bg-surface-muted-dark active:opacity-80",
  outline: "border-2 border-primary-100 bg-transparent active:opacity-80",
  ghost:
    "bg-transparent active:bg-surface-muted-light dark:active:bg-surface-muted-dark",
  danger: "bg-error-light dark:bg-error-dark active:opacity-80",
};

const textVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "text-primary-foreground-light dark:text-primary-foreground-dark",
  secondary: "text-text-light dark:text-text-dark",
  outline: "text-primary-100",
  ghost: "text-primary-100",
  danger: "text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 rounded-lg",
  md: "px-4 py-3 rounded-xl",
  lg: "px-6 py-4 rounded-2xl",
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
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
  const spinnerOnPrimary =
    variant === "outline" || variant === "ghost"
      ? colors.primary[100]
      : colors.light[400];

  return (
    <TouchableOpacity
      className={`items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || loading ? "opacity-50" : ""} ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger"
              ? spinnerOnPrimary
              : colors.primary[100]
          }
        />
      ) : (
        <Text
          className={`font-semibold ${textVariantClasses[variant]} ${textSizeClasses[size]}`}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
