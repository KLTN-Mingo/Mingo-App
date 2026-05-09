import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, isValid, parse } from "date-fns";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/context/ThemeContext";
import { getSemantic } from "@/styles/colors";
import { Text } from "./Text";

interface BaseProps {
  label?: string;
  error?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface ActionPickerOption {
  label: string;
  value: string;
}

export interface ActionSelectPickerProps extends BaseProps {
  value: string;
  onValueChange: (v: string) => void;
  options: ActionPickerOption[];
  surface?: "input" | "component";
}

export function ActionSelectPicker({
  label,
  error,
  className = "",
  placeholder = "Select...",
  disabled,
  value,
  onValueChange,
  options,
  surface = "input",
}: ActionSelectPickerProps) {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");
  const [open, setOpen] = useState(false);

  const rowBg =
    surface === "component"
      ? "bg-component-light dark:bg-component-dark"
      : "bg-input-light dark:bg-input-dark";

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? (value || "");

  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-2 font-medium text-base text-text-light dark:text-text-dark">
          {label}
        </Text>
      ) : null}
      <TouchableOpacity
        activeOpacity={0.75}
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={`flex-row items-center w-full px-4 py-4 rounded-[20px] ${rowBg} ${className}`}
        style={{ borderWidth: 0 }}
      >
        <Text
          className={`flex-1 text-base ${
            selectedLabel
              ? "text-text-light dark:text-text-dark"
              : "text-text-muted-light dark:text-text-muted-dark"
          }`}
          numberOfLines={1}
        >
          {selectedLabel || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={sem.textMuted} />
      </TouchableOpacity>
      {error ? (
        <Text className="mt-1 text-sm text-error-light dark:text-error-dark">
          {error}
        </Text>
      ) : null}

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
    </View>
  );
}

export interface ActionDatePickerProps extends BaseProps {
  value: string;
  onValueChange: (yyyyMmDd: string) => void;
  surface?: "input" | "component";
}

function parseYmd(s: string): Date {
  if (!s?.trim()) return new Date(2000, 0, 15);
  const d = parse(s.trim(), "yyyy-MM-dd", new Date());
  return isValid(d) ? d : new Date(2000, 0, 15);
}

export function ActionDatePicker({
  label,
  error,
  className = "",
  placeholder = "Select date",
  disabled,
  value,
  onValueChange,
  surface = "input",
}: ActionDatePickerProps) {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");
  const [show, setShow] = useState(false);
  const [iosTemp, setIosTemp] = useState(() => parseYmd(value));

  useEffect(() => {
    setIosTemp(parseYmd(value));
  }, [value]);

  const display =
    value?.trim() && isValid(parseYmd(value))
      ? format(parseYmd(value), "dd/MM/yyyy")
      : "";

  const rowBg =
    surface === "component"
      ? "bg-component-light dark:bg-component-dark"
      : "bg-input-light dark:bg-input-dark";

  const onPick = (_: unknown, date?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (date && isValid(date)) {
      onValueChange(format(date, "yyyy-MM-dd"));
      setIosTemp(date);
    }
  };

  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-2 font-medium text-base text-text-light dark:text-text-dark">
          {label}
        </Text>
      ) : null}
      <TouchableOpacity
        activeOpacity={0.75}
        disabled={disabled}
        onPress={() => {
          setIosTemp(parseYmd(value));
          setShow(true);
        }}
        className={`flex-row items-center w-full px-4 py-4 rounded-[20px] ${rowBg} ${className}`}
        style={{ borderWidth: 0 }}
      >
        <Text
          className={`flex-1 text-base ${
            display
              ? "text-text-light dark:text-text-dark"
              : "text-text-muted-light dark:text-text-muted-dark"
          }`}
          numberOfLines={1}
        >
          {display || placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={sem.textMuted} />
      </TouchableOpacity>
      {error ? (
        <Text className="mt-1 text-sm text-error-light dark:text-error-dark">
          {error}
        </Text>
      ) : null}

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
                  <Text className="text-text-muted-light">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    onValueChange(format(iosTemp, "yyyy-MM-dd"));
                    setShow(false);
                  }}
                >
                  <Text className="text-primary-100 font-semibold">Done</Text>
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
    </View>
  );
}
