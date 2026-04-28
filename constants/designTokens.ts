/**
 * Design tokens — Mingle / Mingo
 * Bảng màu theo mockup: dark (charcoal + sage + cream) và light (trắng + xám input + chữ đậm).
 */

export type ColorScheme = "light" | "dark";

/** Viền mặc định dùng xuyên app (Tailwind `border-*`, semantic, v.v.) */
export const BORDER_DEFAULT = "#CCCCCC";

/** Thang màu “dark” (tên gốc từ thiết kế — dùng cho dark mode) */
export const paletteDark = {
  100: "#EFE7DF",
  200: "#252525",
  300: "#515E5A",
  400: "#2D2F2F",
  500: "#1E2021",
} as const;

/** Thang màu “light” (semantic cho chế độ sáng) */
export const paletteLight = {
  100: "#1E2021",
  200: "#F2F2F2",
  300: "#515E5A",
  400: "#F1F4F3",
  500: "#FFFFFF",
  700: "#F0F2F5",
} as const;


export const palettePrimary = {
  100: "#768D85",
} as const;

/** Export cho import kiểu colors.dark[100] / colors.light[500] */
export const colors = {
  primary: { ...palettePrimary },
  dark: { ...paletteDark },
  light: { ...paletteLight },
} as const;

/** Nền khối UI (search, outline button, …) — light #F1F4F3 / dark #2D2F2F */
export const componentBackground = {
  light: "#F1F4F3",
  dark: "#2D2F2F",
} as const;

export type SemanticColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  /** Nền component (khớp `bg-component-light` / `dark:bg-component-dark`) */
  componentBackground: string;
  input: string;
  text: string;
  textMuted: string;
  border: string;
  pillBorder: string;
  primary: string;
  onPrimary: string;
  placeholder: string;
};

export function getSemantic(scheme: ColorScheme): SemanticColors {
  if (scheme === "dark") {
    return {
      background: paletteDark[500],
      surface: paletteDark[400],
      surfaceMuted: paletteDark[200],
      componentBackground: componentBackground.dark,
      input: paletteDark[400],
      text: paletteDark[100],
      textMuted: paletteDark[300],
      border: BORDER_DEFAULT,
      pillBorder: BORDER_DEFAULT,
      primary: palettePrimary[100],
      onPrimary: paletteDark[100],
      placeholder: paletteDark[300],
    };
  }
  return {
    background: paletteLight[500],
    surface: paletteLight[500],
    surfaceMuted: paletteLight[200],
    componentBackground: componentBackground.light,
    input: paletteLight[400],
    text: paletteLight[100],
    textMuted: paletteLight[300],
    border: BORDER_DEFAULT,
    pillBorder: BORDER_DEFAULT,
    primary: palettePrimary[100],
    onPrimary: "#FFFFFF",
    placeholder: "#9CA3AF",
  };
}

export type StatusColorKind = "success" | "warning" | "error" | "info";

export const statusColors = {
  success: {
    light: "#22C55E",
    dark: "#4ADE80",
  },
  warning: {
    light: "#F59E0B",
    dark: "#FBBF24",
  },
  error: {
    light: "#EF4444",
    dark: "#F87171",
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
    appBackground: paletteDark[500],
    cardSurface: paletteDark[400],
    componentSurface: componentBackground.dark,
    surfaceMuted: paletteDark[200],
    textPrimary: paletteDark[100],
    textMuted: paletteDark[300],
    inputField: paletteDark[400],
    accent: palettePrimary[100],
  },
  light: {
    appBackground: paletteLight[500],
    card: paletteLight[500],
    componentSurface: componentBackground.light,
    chipInactive: paletteLight[200],
    textPrimary: paletteLight[100],
    textMuted: paletteLight[300],
    inputField: paletteLight[400],
    accent: palettePrimary[100],
  },
} as const;
