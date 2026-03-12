import { useEffect } from "react";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";

const AuthLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Montserrat-Black": require("../../assets/font/Montserrat-Black.ttf"),
    "Montserrat-Bold": require("../../assets/font/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("../../assets/font/Montserrat-ExtraBold.ttf"),
    "Montserrat-ExtraLight": require("../../assets/font/Montserrat-ExtraLight.ttf"),
    "Montserrat-Light": require("../../assets/font/Montserrat-Light.ttf"),
    "Montserrat-Medium": require("../../assets/font/Montserrat-Medium.ttf"),
    "Montserrat-Regular": require("../../assets/font/Montserrat-Regular.ttf"),
    "Montserrat-SemiBold": require("../../assets/font/Montserrat-SemiBold.ttf"),
    "Montserrat-Thin": require("../../assets/font/Montserrat-Thin.ttf"),
    "JosefinSans-SemiBold": require("../../assets/font/JosefinSans-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || error) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  // Nếu lỗi font vẫn cho vào màn hình (dùng font mặc định)
  if (!fontsLoaded && !error) return null;
  return (
    <Stack initialRouteName="signin">
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;
