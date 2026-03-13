import { useEffect } from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";

/**
 * Bọc nội dung bằng component này để tắt keyboard hoặc đóng modal khi click ra ngoài
 */
export const ClickOutsideWrapper = ({
  onClickOutside,
  children,
}: {
  onClickOutside: () => void;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const hide = Keyboard.addListener("keyboardDidHide", onClickOutside);
    return () => hide.remove();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={onClickOutside}>
      <View style={{ flex: 1 }}>{children}</View>
    </TouchableWithoutFeedback>
  );
};
