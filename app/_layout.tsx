import "@/global.css";

import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CallProvider } from "@/context/CallContext";
import { ChatProvider } from "@/context/ChatContext";
import { ThemeProvider as AppThemeProvider } from "@/context/ThemeContext";

// Giữ splash hiển thị cho đến khi auth check xong
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

function HideSplashWhenReady({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && fontsLoaded) SplashScreen.hideAsync();
  }, [isLoading, fontsLoaded]);

  // An toàn: luôn ẩn splash sau 2.5s để tránh kẹt nếu checkAuth lỗi/hang
  useEffect(() => {
    const t = setTimeout(() => SplashScreen.hideAsync(), 2500);
    return () => clearTimeout(t);
  }, []);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Thin": require("@/assets/font/Montserrat-Thin.ttf"),
    "Montserrat-Light": require("@/assets/font/Montserrat-Light.ttf"),
    "Montserrat-ExtraLight": require("@/assets/font/Montserrat-ExtraLight.ttf"),
    "Montserrat-Regular": require("@/assets/font/Montserrat-Regular.ttf"),
    "Montserrat-Medium": require("@/assets/font/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("@/assets/font/Montserrat-SemiBold.ttf"),
    "Montserrat-Bold": require("@/assets/font/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("@/assets/font/Montserrat-ExtraBold.ttf"),
    "Montserrat-Black": require("@/assets/font/Montserrat-Black.ttf"),
    "Montserrat-Italic": require("@/assets/font/Montserrat-Italic.ttf"),
    "JosefinSans-SemiBold": require("@/assets/font/JosefinSans-SemiBold.ttf"),
  });

  return (
    <AuthProvider>
      <>
        <HideSplashWhenReady fontsLoaded={fontsLoaded ?? false} />
        <AppThemeProvider>
          {/* Luôn dùng DarkTheme cho toàn bộ app */}
          <ChatProvider>
            <CallProvider>
              <ThemeProvider value={DarkTheme}>
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="chat" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="modal"
                    options={{ presentation: "modal", title: "Modal" }}
                  />
                  <Stack.Screen
                    name="(modals)"
                    options={{ headerShown: false }}
                  />
                </Stack>
                <StatusBar style="light" />
              </ThemeProvider>
            </CallProvider>
          </ChatProvider>
        </AppThemeProvider>
      </>
    </AuthProvider>
  );
}
