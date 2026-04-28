/**
 * Design tokens — Mingo
 * Theo Mingo UI Design Guide (phiên bản mới)
 */

export type ColorScheme = "light" | "dark";

/** Viền mặc định dùng xuyên app */
export const BORDER_DEFAULT = {
  light: "#BAC6C2",
  dark: "#2D2F2F",
} as const;

/** Primary color — Muted sage green */
export const palettePrimary = {
  light: "#768D85",
  lightMuted: "#BAC6C2",
  dark: "#515E5A",
  darkAccent: "#CFBFAD",
} as const;

/** Icon colors — Semantic colors for icons */
export const paletteIcon = {
  light: "#1E2021",
  lightMuted: "#6B6B6B",
  dark: "#FAFAFA",
  darkMuted: "#6B6B6B",
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

/** Border radius scale */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

/** Thang màu light mode */
export const paletteLight = {
  background: "#FFFFFF",
  surface: "#F1F4F3",
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
      textMuted: paletteDark.textMuted,
      textSecondary: paletteDark.textSecondary,
      border: BORDER_DEFAULT.dark,
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
    textMuted: paletteLight.textMuted,
    textSecondary: paletteLight.textSecondary,
    border: BORDER_DEFAULT.light,
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
    textSecondary: paletteDark.textSecondary,
    textMuted: paletteDark.textMuted,
    inputField: paletteDark.surface,
    accent: palettePrimary.dark,
    border: BORDER_DEFAULT.dark,
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
    textSecondary: paletteLight.textSecondary,
    textMuted: paletteLight.textMuted,
    inputField: paletteLight.surface,
    accent: palettePrimary.light,
    border: BORDER_DEFAULT.light,
    danger: paletteLight.danger,
    online: paletteLight.online,
  },
} as const;
