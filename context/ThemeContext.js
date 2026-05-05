import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance } from "react-native";

const STORAGE_KEY = "mingo-color-scheme";

const ThemeContext = createContext({
  colorScheme: "dark",
  toggleColorScheme: () => {},
  setColorScheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [colorScheme, setColorSchemeState] = useState("dark");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const initial =
          stored === "light" || stored === "dark" ? stored : "dark";
        if (!cancelled) {
          setColorSchemeState(initial);
          Appearance.setColorScheme(initial);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setColorScheme = useCallback((scheme) => {
    const next = scheme === "light" ? "light" : "dark";
    setColorSchemeState(next);
    Appearance.setColorScheme(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggleColorScheme = useCallback(() => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  }, [colorScheme, setColorScheme]);

  const value = useMemo(
    () => ({
      colorScheme,
      toggleColorScheme,
      setColorScheme,
      hydrated,
    }),
    [colorScheme, toggleColorScheme, setColorScheme, hydrated]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
