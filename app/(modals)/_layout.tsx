import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "transparentModal", // hoặc "modal" cho iOS style
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="incoming-call" options={{ headerShown: false }} />
      <Stack.Screen name="[roomId]" options={{ headerShown: false }} />
    </Stack>
  );
}
