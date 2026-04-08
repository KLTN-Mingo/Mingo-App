import type { ReactNode } from "react";

export type AppColorScheme = "light" | "dark";

export function ThemeProvider(props: { children: ReactNode }): React.JSX.Element;

export function useTheme(): {
  colorScheme: AppColorScheme;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: AppColorScheme) => void;
  hydrated: boolean;
};
