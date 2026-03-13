import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { colors } from "@/styles/colors";
import { useTheme } from "@/context/ThemeContext";

interface ButtonProps {
  title: any;
  color?: string;
  onPress?: () => void;
  size?: "small" | "large";
  fontColor?: string;
  outline?: boolean;
  border?: boolean;
  className?: string;
  borderRadius?: number;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  color,
  onPress,
  size = "large",
  fontColor,
  outline,
  border = false,
  className,
  borderRadius = 12,
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
}) => {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  const backgroundColor = outline
    ? "transparent"
    : disabled
      ? colorScheme === "dark"
        ? colors.dark[400]
        : colors.light[400]
      : (color ?? colors.primary[100]);

  const textColor =
    fontColor ?? (isDark ? colors.dark[100] : colors.light[100]);
  const borderColor = isDark ? "#FFFFFF" : "#000000";

  const containerStyle = [
    styles.base,
    size === "small" ? styles.small : styles.large,
    {
      borderRadius,
      backgroundColor,
      borderWidth: border ? 1 : 0,
      borderColor: border ? borderColor : "transparent",
      opacity: disabled ? 0.7 : 1,
    },
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={className}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {iconLeft && <View style={styles.icon}>{iconLeft}</View>}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
          {iconRight && <View style={styles.icon}>{iconRight}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  small: {
    width: 140,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  large: {
    width: "100%",
    paddingVertical: 12,
  },
  text: {
    fontSize: 16,
    fontFamily: "Montserrat-Medium",
    textAlign: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginHorizontal: 4,
  },
});

export default Button;
