/**
 * Design tokens — Mingo
 * Theo Mingo UI Design Guide (phiên bản mới)
 */

export type ColorScheme = "light" | "dark";

/** Viền mặc định dùng xuyên app */
export const BORDER_BY_SCHEME = {
  light: "#BAC6C2",
  dark: "#2D2F2F",
} as const;

export const BORDER_DEFAULT = BORDER_BY_SCHEME.light;

/** Primary color — Muted sage green */
export const palettePrimary = {
  light: "#768D85",
  lightMuted: "#BAC6C2",
  dark: "#515E5A",
  darkAccent: "#CFBFAD",
  50: "#E8EDEB",
  100: "#768D85",
  200: "#9AA9A2",
  300: "#BAC6C2",
  400: "#D4DED9",
  500: "#768D85",
  600: "#5E7069",
  700: "#475852",
  800: "#313F3B",
  900: "#1A2723",
} as const;

/** Icon colors — Semantic colors for icons */
export const paletteIcon = {
  light: "#1E2021",
  lightMuted: "#6B6B6B",
  dark: "#FAFAFA",
  darkMuted: "#6B6B6B",
} as const;

export const paletteTitle = {
  light: "#D9542C",
  dark: "#D9542C",
} as const;

/** Spacing scale */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const layoutSpacing = {
  contentTop: {
    ios: spacing.xxl + spacing.xl,
    android: spacing.xxl,
  },
  contentBottom: spacing.xxl,
  horizontal: spacing.xl,
  modalTopGap: spacing.lg,
} as const;

/** Border radius scale */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

/** Thang màu light mode */
export const paletteLight = {
  50: "#FAFAFA",
  100: "#1E2021",
  200: "#6B6B6B",
  300: "#CCCCCC",
  400: "#BAC6C2",
  500: "#FFFFFF",
  background: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceLight: "#FAFAFA",
  surfaceMuted: "#F1F4F3",
  surfaceElevated: "#FFFFFF",
  textPrimary: "#1E2021",
  textSecondary: "#6B6B6B",
  textMuted: "#CCCCCC",
  border: "#BAC6C2",
  borderSubtle: "#F1F4F3",
  white: "#FFFFFF",
  danger: "#EF4444",
  online: "#22C55E",
} as const;

/** Thang màu dark mode */
export const paletteDark = {
  50: "#FAFAFA",
  100: "#FAFAFA",
  200: "#CCCCCC",
  300: "#6B6B6B",
  400: "#2D2F2F",
  500: "#1E2021",
  background: "#1E2021",
  surface: "#252525",
  surfaceLight: "#2D2F2F",
  surfaceMuted: "#252525",
  surfaceElevated: "#2D2F2F",
  textPrimary: "#FAFAFA",
  textSecondary: "#6B6B6B",
  textMuted: "#CCCCCC",
  border: "#2D2F2F",
  borderAccent: "#515E5A",
  white: "#FFFFFF",
  danger: "#FF453A",
  online: "#22C55E",
} as const;

/** Export cho import kiểu colors.light.textPrimary */
export const colors = {
  primary: { ...palettePrimary },
  light: { ...paletteLight },
  dark: { ...paletteDark },
} as const;

export type SemanticColors = {
  background: string;
  surface: string;
  surfaceLight: string;
  surfaceMuted: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  title: string;
  border: string;
  borderSubtle: string;
  primary: string;
  primaryMuted: string;
  onPrimary: string;
  placeholder: string;
  danger: string;
  online: string;
  white: string;
  icon: string;
  iconMuted: string;
};

export function getSemantic(scheme: ColorScheme): SemanticColors {
  if (scheme === "dark") {
    return {
      background: paletteDark.background,
      surface: paletteDark.surface,
      surfaceLight: paletteDark.surfaceLight,
      surfaceMuted: paletteDark.surfaceMuted,
      surfaceElevated: paletteDark.surfaceElevated,
      text: paletteDark.textPrimary,
      title: paletteTitle.dark,
      textMuted: paletteDark.textMuted,
      textSecondary: paletteDark.textSecondary,
      border: BORDER_BY_SCHEME.dark,
      borderSubtle: paletteDark.border,
      primary: palettePrimary.dark,
      primaryMuted: palettePrimary.darkAccent,
      onPrimary: paletteDark.white,
      placeholder: paletteDark.textMuted,
      danger: paletteDark.danger,
      online: paletteDark.online,
      white: paletteDark.white,
      icon: paletteIcon.dark,
      iconMuted: paletteIcon.darkMuted,
    };
  }
  return {
    background: paletteLight.background,
    surface: paletteLight.surface,
    surfaceLight: paletteLight.surfaceLight,
    surfaceMuted: paletteLight.surfaceMuted,
    surfaceElevated: paletteLight.surfaceElevated,
    text: paletteLight.textPrimary,
    title: paletteTitle.light,
    textMuted: paletteLight.textMuted,
    textSecondary: paletteLight.textSecondary,
    border: BORDER_BY_SCHEME.light,
    borderSubtle: paletteLight.borderSubtle,
    primary: palettePrimary.light,
    primaryMuted: palettePrimary.lightMuted,
    onPrimary: paletteLight.white,
    placeholder: paletteLight.textMuted,
    danger: paletteLight.danger,
    online: paletteLight.online,
    white: paletteLight.white,
    icon: paletteIcon.light,
    iconMuted: paletteIcon.lightMuted,
  };
}

export type StatusColorKind = "success" | "warning" | "error" | "info";

export const statusColors = {
  success: {
    light: "#22C55E",
    dark: "#22C55E",
  },
  warning: {
    light: "#F59E0B",
    dark: "#FBBF24",
  },
  error: {
    light: "#EF4444",
    dark: "#FF453A",
  },
  info: {
    light: "#3B82F6",
    dark: "#60A5FA",
  },
} as const;

export function getStatusColor(
  scheme: ColorScheme,
  kind: StatusColorKind
): string {
  return statusColors[kind][scheme];
}

export const colorTable = {
  dark: {
    appBackground: paletteDark.background,
    cardSurface: paletteDark.surface,
    componentSurface: paletteDark.surface,
    surfaceMuted: paletteDark.surfaceMuted,
    surfaceElevated: paletteDark.surfaceElevated,
    textPrimary: paletteDark.textPrimary,
    title: paletteTitle.dark,
    textSecondary: paletteDark.textSecondary,
    textMuted: paletteDark.textMuted,
    inputField: paletteDark.surface,
    accent: palettePrimary.dark,
    border: BORDER_BY_SCHEME.dark,
    danger: paletteDark.danger,
    online: paletteDark.online,
  },
  light: {
    appBackground: paletteLight.background,
    card: paletteLight.background,
    componentSurface: paletteLight.surface,
    surfaceMuted: paletteLight.surfaceMuted,
    surfaceElevated: paletteLight.surfaceElevated,
    textPrimary: paletteLight.textPrimary,
    title: paletteTitle.light,
    textSecondary: paletteLight.textSecondary,
    textMuted: paletteLight.textMuted,
    inputField: paletteLight.surface,
    accent: palettePrimary.light,
    border: BORDER_BY_SCHEME.light,
    danger: paletteLight.danger,
    online: paletteLight.online,
  },
} as const;
