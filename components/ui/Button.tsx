import { colors } from "@/styles/colors";
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

/** Match `Tab` colors; use `rounded-full` so `flex-1` wide actions stay pill-shaped (fixed px radius looks flat on long bars). */
const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-100 active:opacity-90",
  secondary:
    "bg-surface-muted-light dark:bg-surface-muted-dark active:opacity-80",
  outline:
    "bg-surface-muted-light dark:bg-transparent border border-border-light dark:border-border-dark active:opacity-80",
  ghost:
    "bg-transparent active:bg-surface-muted-light dark:active:bg-surface-muted-dark",
  danger: "bg-red-100 dark:bg-red-900 active:opacity-80",
};

const textVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "text-primary-foreground-light dark:text-primary-foreground-dark",
  secondary: "text-text-light dark:text-text-dark",
  outline: "text-text-light dark:text-text-dark",
  ghost: "text-primary-600 dark:text-primary-300",
  danger: "text-red-600 dark:text-red-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 min-h-[40px]",
  md: "px-4 py-2 min-h-[44px]",
  lg: "px-5 py-3 min-h-[48px]",
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: "text-sm font-medium",
  md: "text-base font-medium",
  lg: "text-lg font-medium",
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
      : colors.light[500];

  return (
    <TouchableOpacity
      className={twMerge(
        `items-center justify-center rounded-[12px] gap-2 self-stretch ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || loading ? "opacity-50" : ""} ${className}`,
      )}
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
        <Text className={`${textVariantClasses[variant]} ${textSizeClasses[size]}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
