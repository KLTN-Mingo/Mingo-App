/**
 * Màu dùng cho React Navigation / Expo (tương thích light & dark).
 */

import { Platform } from "react-native";

import { colors } from "./designTokens";

const tintColor = colors.primary[100];

export const Colors = {
  light: {
    text: colors.light[100],
    background: colors.light[500],
    tint: tintColor,
    icon: colors.light[100],
    tabIconDefault: colors.light[300],
    tabIconSelected: tintColor,
  },
  dark: {
    text: colors.dark[100],
    background: colors.dark[500],
    tint: tintColor,
    icon: colors.dark[100],
    tabIconDefault: colors.dark[300],
    tabIconSelected: tintColor,
  },
};

const montserratStack =
  "'Montserrat-Regular', 'Montserrat-Medium', system-ui, sans-serif";

export const Fonts = Platform.select({
  ios: {
    sans: "Montserrat-Regular",
    serif: "Montserrat-Regular",
    rounded: "Montserrat-Regular",
    mono: "monospace",
  },
  default: {
    sans: "Montserrat-Regular",
    serif: "Montserrat-Regular",
    rounded: "Montserrat-Regular",
    mono: "monospace",
  },
  web: {
    sans: montserratStack,
    serif: montserratStack,
    rounded: montserratStack,
    mono: "ui-monospace, monospace",
  },
});
