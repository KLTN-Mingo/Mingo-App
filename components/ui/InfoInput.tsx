import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, isValid, parse } from "date-fns";
import * as Linking from "expo-linking";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/context/ThemeContext";
import { getSemantic } from "@/styles/colors";
import { Text } from "./Text";

const BORDER = "#CCCCCC";
const MIN_H = 56;

type BaseProps = {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
};

export type InfoInputTextProps = BaseProps &
  TextInputProps & {
    mode?: "text";
    /** Gợi ý lọc theo text đang nhập */
    suggestions?: string[];
    /** Hiện link mở Google Maps (tìm theo nội dung ô) */
    mapPickEnabled?: boolean;
  };

export type InfoInputSelectProps = BaseProps & {
  mode: "select";
  value: string;
  onValueChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
};

export type InfoInputDateProps = BaseProps & {
  mode: "date";
  value: string;
  onValueChange: (yyyyMmDd: string) => void;
};

export type InfoInputProps =
  | InfoInputTextProps
  | InfoInputSelectProps
  | InfoInputDateProps;

function InfoFieldShell({
  label,
  required,
  error,
  className,
  children,
  accessory,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
  accessory?: React.ReactNode;
}) {
  return (
    <View className={`w-full ${className ?? ""}`}>
      <View className="relative mt-3">
        <View className="absolute -top-2.5 left-3 z-10 px-1 bg-background-light dark:bg-background-dark flex-row items-center">
          <Text className="text-sm font-medium text-text-light dark:text-text-dark">
            {label}
          </Text>
          {required ? (
            <Text className="text-sm font-medium text-red-500"> *</Text>
          ) : null}
        </View>
        <View
          className="rounded-lg bg-white dark:bg-neutral-900 px-4 py-3 justify-center"
          style={{
            minHeight: MIN_H,
            borderWidth: 1,
            borderColor: BORDER,
          }}
        >
          {children}
        </View>
      </View>
      {accessory}
      {error ? (
        <Text className="mt-1 text-sm text-error-light dark:text-error-dark">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function InfoInputText(props: InfoInputTextProps) {
  const {
    label,
    required,
    error,
    className,
    suggestions = [],
    mapPickEnabled,
    mode: _m,
    onFocus,
    onBlur,
    ...textProps
  } = props;
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");
  const [openSug, setOpenSug] = useState(false);

  const filtered = useMemo(() => {
    const q = String(textProps.value ?? "")
      .trim()
      .toLowerCase();
    if (!q || suggestions.length === 0) return [];
    return suggestions
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 6);
  }, [textProps.value, suggestions]);

  const openMaps = useCallback(() => {
    const q = String(textProps.value ?? "").trim() || "Việt Nam";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
    Linking.openURL(url).catch(() => undefined);
  }, [textProps.value]);

  const accessory =
    mapPickEnabled ? (
      <TouchableOpacity onPress={openMaps} className="mt-2 self-start">
        <Text className="text-sm text-primary-100 font-medium">
          Mở Google Maps để chọn / xem vị trí
        </Text>
      </TouchableOpacity>
    ) : null;

  return (
    <InfoFieldShell
      label={label}
      required={required}
      error={error}
      className={className}
      accessory={accessory}
    >
      <View>
        <TextInput
          className="py-1 font-regular text-base text-text-light dark:text-text-dark"
          placeholderTextColor={sem.placeholder}
          underlineColorAndroid="transparent"
          onFocus={(e) => {
            setOpenSug(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setTimeout(() => setOpenSug(false), 150);
            onBlur?.(e);
          }}
          {...textProps}
        />
        {openSug && filtered.length > 0 ? (
          <View
            className="mt-2 rounded-md border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark max-h-36 overflow-hidden"
          >
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={filtered}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-3 py-2.5 border-b border-border-light dark:border-border-dark"
                  onPress={() => {
                    textProps.onChangeText?.(item);
                    setOpenSug(false);
                  }}
                >
                  <Text className="text-text-light dark:text-text-dark text-sm">
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : null}
      </View>
    </InfoFieldShell>
  );
}

function parseYmd(s: string): Date {
  if (!s?.trim()) return new Date(2000, 0, 15);
  const d = parse(s.trim(), "yyyy-MM-dd", new Date());
  return isValid(d) ? d : new Date(2000, 0, 15);
}

function InfoInputSelect(props: InfoInputSelectProps) {
  const {
    label,
    required,
    error,
    className,
    value,
    onValueChange,
    options,
    placeholder = "Chọn...",
  } = props;
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");
  const [open, setOpen] = useState(false);
  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? (value || "");

  return (
    <InfoFieldShell label={label} required={required} error={error} className={className}>
      <TouchableOpacity
        className="flex-row items-center justify-between min-h-[28px]"
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        <Text
          className={`flex-1 text-base ${
            selectedLabel
              ? "text-text-light dark:text-text-dark"
              : "text-text-muted-light dark:text-text-muted-dark"
          }`}
        >
          {selectedLabel || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={sem.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="bg-background-light dark:bg-background-dark rounded-t-2xl max-h-[70%] pb-8"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="items-center py-2">
              <View className="w-10 h-1 rounded-full bg-border-light dark:bg-border-dark" />
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-4 py-4 border-b border-border-light dark:border-border-dark"
                  onPress={() => {
                    onValueChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text className="text-text-light dark:text-text-dark text-base">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </InfoFieldShell>
  );
}

function InfoInputDate(props: InfoInputDateProps) {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");
  const { label, required, error, className, value, onValueChange } = props;
  const [show, setShow] = useState(false);
  const [iosTemp, setIosTemp] = useState(() => parseYmd(value));

  useEffect(() => {
    setIosTemp(parseYmd(value));
  }, [value]);

  const display = value?.trim() && isValid(parseYmd(value))
    ? format(parseYmd(value), "dd/MM/yyyy")
    : "";

  const onPick = (_: unknown, date?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }
    if (date && isValid(date)) {
      onValueChange(format(date, "yyyy-MM-dd"));
      setIosTemp(date);
    }
  };

  const openPicker = () => {
    setIosTemp(parseYmd(value));
    setShow(true);
  };

  return (
    <InfoFieldShell label={label} required={required} error={error} className={className}>
      <TouchableOpacity
        className="flex-row items-center justify-between min-h-[28px]"
        onPress={openPicker}
        activeOpacity={0.75}
      >
        <Text
          className={`flex-1 text-base ${
            display
              ? "text-text-light dark:text-text-dark"
              : "text-text-muted-light dark:text-text-muted-dark"
          }`}
        >
          {display || "Chọn ngày sinh"}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={sem.textMuted} />
      </TouchableOpacity>

      {Platform.OS === "android" && show ? (
        <DateTimePicker
          value={parseYmd(value)}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onPick}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal visible={show} transparent animationType="slide">
          <Pressable
            className="flex-1 bg-black/40 justify-end"
            onPress={() => setShow(false)}
          >
            <Pressable
              className="bg-background-light dark:bg-background-dark rounded-t-2xl px-4 pb-8 pt-2"
              onPress={(e) => e.stopPropagation()}
            >
              <View className="flex-row justify-between items-center mb-2">
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text className="text-text-muted-light">Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    onValueChange(format(iosTemp, "yyyy-MM-dd"));
                    setShow(false);
                  }}
                >
                  <Text className="text-primary-100 font-semibold">Xong</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={iosTemp}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(_, d) => {
                  if (d && isValid(d)) setIosTemp(d);
                }}
                themeVariant={colorScheme === "dark" ? "dark" : "light"}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </InfoFieldShell>
  );
}

/** Ô form kiểu Figma: nhãn trên viền, viền #CCCCCC, bo 8px — text / chọn / ngày */
export function InfoInput(props: InfoInputProps) {
  const mode = "mode" in props && props.mode === "select" ? "select" : "mode" in props && props.mode === "date" ? "date" : "text";
  if (mode === "select") {
    return <InfoInputSelect {...(props as InfoInputSelectProps)} />;
  }
  if (mode === "date") {
    return <InfoInputDate {...(props as InfoInputDateProps)} />;
  }
  return <InfoInputText {...(props as InfoInputTextProps)} />;
}
