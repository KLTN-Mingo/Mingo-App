import "@/global.css";

import { Jost_600SemiBold, Jost_700Bold } from "@expo-google-fonts/jost";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import { BORDER_DEFAULT, colors } from "@/constants/designTokens";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import {
  ThemeProvider as AppThemeProvider,
  useTheme,
} from "@/context/ThemeContext";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

function HideSplashWhenReady({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && fontsLoaded) SplashScreen.hideAsync();
  }, [isLoading, fontsLoaded]);

  useEffect(() => {
    const t = setTimeout(() => SplashScreen.hideAsync(), 2500);
    return () => clearTimeout(t);
  }, []);

  return null;
}

function ThemedNavigation() {
  const { colorScheme } = useTheme();

  const navigationTheme = useMemo(() => {
    if (colorScheme === "dark") {
      return {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: colors.primary[100],
          background: colors.dark[500],
          card: colors.dark[400],
          text: colors.dark[100],
          border: colors.dark[300],
        },
      };
    }
    return {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: colors.primary[100],
        background: colors.light[500],
        card: colors.light[500],
        text: colors.light[100],
        border: BORDER_DEFAULT,
      },
    };
  }, [colorScheme]);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerTitleStyle: { fontFamily: "Montserrat-SemiBold" },
          headerBackTitleStyle: { fontFamily: "Montserrat-Regular" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Thin": require("@/assets/fonts/Montserrat-Thin.ttf"),
    "Montserrat-Light": require("@/assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-ExtraLight": require("@/assets/fonts/Montserrat-ExtraLight.ttf"),
    "Montserrat-Regular": require("@/assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Medium": require("@/assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("@/assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Bold": require("@/assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("@/assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-Black": require("@/assets/fonts/Montserrat-Black.ttf"),
    "Montserrat-Italic": require("@/assets/fonts/Montserrat-Italic.ttf"),
    "JosefinSans-SemiBold": require("@/assets/fonts/JosefinSans-SemiBold.ttf"),
    Jost_600SemiBold,
    Jost_700Bold,
  });

  return (
    <AuthProvider>
      <View className="flex-1 font-sans" style={{ flex: 1 }}>
        <HideSplashWhenReady fontsLoaded={fontsLoaded ?? false} />
        <AppThemeProvider>
          <ThemedNavigation />
        </AppThemeProvider>
      </View>
    </AuthProvider>
  );
}
