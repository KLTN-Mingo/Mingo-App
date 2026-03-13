import React from "react";
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { colors } from "@/styles/colors";

interface InputProps {
  avatarSrc?: string;
  placeholder?: string;
  readOnly?: boolean;
  onClick?: () => void;
  value?: string;
  onChange?: (text: string) => void;
  onKeyDown?: () => void;
  onSubmitEditing?: (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => void;
  returnKeyType?: TextInputProps["returnKeyType"];
}

const Input = ({
  avatarSrc,
  placeholder = "",
  readOnly = false,
  onClick,
  value,
  onChange,
  onKeyDown,
  onSubmitEditing,
  returnKeyType = "default",
}: InputProps) => {
  const { colorScheme } = useTheme();
  const textColor =
    colorScheme === "dark" ? colors.dark[100] : colors.light[100];

  return (
    <View style={styles.container}>
      {avatarSrc && (
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                avatarSrc ||
                "https://i.pinimg.com/236x/88/bd/6b/88bd6bd828ec509f4bda0d9f9450824d.jpg",
            }}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.inputWrapper,
          {
            backgroundColor:
              colorScheme === "dark" ? colors.dark[400] : colors.light[400],
          },
        ]}
        onPress={onClick}
        disabled={readOnly}
        activeOpacity={0.9}
      >
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={
            colorScheme === "dark" ? colors.dark[300] : colors.light[300]
          }
          editable={!readOnly}
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSubmitEditing || onKeyDown}
          returnKeyType={returnKeyType}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 999,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
  },
});

export default Input;
