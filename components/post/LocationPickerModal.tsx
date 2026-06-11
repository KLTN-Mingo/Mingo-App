import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, TouchableOpacity, View } from "react-native";

import { SafeModalSheet } from "@/components/containers/SafeLayout";
import { CancelIcon } from "@/components/shared/icons/Icons";
import { SearchBarInput } from "@/components/shared/ui/search-bar";
import { Text } from "@/components/ui";
import { getSemantic } from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";
import {
  useVNLocationSuggestions,
  type VNLocationSuggestion,
} from "@/hooks/use-vn-locations";

interface LocationPickerModalProps {
  visible: boolean;
  initialValue?: string;
  onClose: () => void;
  onSelect: (locationName: string) => void;
}

type LocationOption = string | VNLocationSuggestion;

function splitAddressParts(input: string): {
  prefix: string;
  locationQuery: string;
} {
  const raw = input.trim();
  if (!raw) return { prefix: "", locationQuery: "" };

  const commaIndex = raw.lastIndexOf(",");
  if (commaIndex < 0) {
    return { prefix: "", locationQuery: raw };
  }

  const prefix = raw.slice(0, commaIndex).trim();
  const locationQuery = raw.slice(commaIndex + 1).trim();
  return { prefix, locationQuery };
}

export function LocationPickerModal({
  visible,
  initialValue,
  onClose,
  onSelect,
}: LocationPickerModalProps) {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");
  const iconColor = sem.title;
  const mutedIconColor = sem.iconMuted;

  const [query, setQuery] = useState("");
  const { prefix, locationQuery } = useMemo(
    () => splitAddressParts(query),
    [query]
  );
  const suggestions = useVNLocationSuggestions(locationQuery, 30);
  const popularSuggestions = useMemo(
    () => [
      "Hà Nội",
      "TP. Hồ Chí Minh",
      "Đà Nẵng",
      "Cần Thơ",
      "Hải Phòng",
      "Nha Trang",
    ],
    []
  );
  const locationOptions = useMemo<LocationOption[]>(
    () => (locationQuery.trim().length > 0 ? suggestions : popularSuggestions),
    [locationQuery, popularSuggestions, suggestions]
  );

  useEffect(() => {
    if (visible) {
      setQuery(initialValue ?? "");
    }
  }, [visible, initialValue]);

  const handlePick = (name: string) => {
    const next = prefix ? `${prefix}, ${name}` : name;
    onSelect(next);
    onClose();
  };

  const handleClear = () => {
    onSelect("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <SafeModalSheet minHeight="60%">
          <View className="flex-row items-center mb-3">
            <Text className="flex-1 text-[20px] leading-7 font-semibold text-title-light dark:text-title-dark">
              Add location
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CancelIcon size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          <View className="mb-3">
            <SearchBarInput
              placeholder="Số nhà, đường..., tỉnh/thành"
              value={query}
              onChangeText={setQuery}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          {/* <Text variant="muted" className="mb-3 text-xs">
	            Gợi ý lấy từ dữ liệu địa chỉ Việt Nam trong app.
	          </Text> */}

          {locationQuery.trim().length > 0 ? (
            <Text className="mb-2 text-xs text-text-muted-light dark:text-text-muted-dark">
              Từ khóa: {locationQuery.trim()}
            </Text>
          ) : null}

          {initialValue ? (
            <View className="mb-3 flex-row items-center rounded-full bg-input-light dark:bg-input-dark px-3 py-2">
              <Ionicons
                name="location-outline"
                size={18}
                color={mutedIconColor}
              />
              <Text
                numberOfLines={1}
                className="ml-2 flex-1 text-sm text-text-light dark:text-text-dark"
              >
                {initialValue}
              </Text>
              <TouchableOpacity
                onPress={handleClear}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={mutedIconColor}
                />
              </TouchableOpacity>
            </View>
          ) : null}

          <FlatList
            data={locationOptions}
            keyExtractor={(it) =>
              typeof it === "string" ? `popular-${it}` : it.id
            }
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View className="py-8 items-center">
                <Ionicons
                  name="location-outline"
                  size={28}
                  color={mutedIconColor}
                />
                <Text variant="muted" className="mt-2 text-sm text-center">
                  {locationQuery.trim().length > 0
                    ? "No locations match your search"
                    : "Type to search or pick from suggestions"}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  handlePick(typeof item === "string" ? item : item.shortLabel)
                }
                activeOpacity={0.65}
                className="flex-row items-center py-3 px-1 border-b border-border-light dark:border-border-dark"
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={mutedIconColor}
                />
                <Text
                  className="ml-3 flex-1 text-sm text-text-light dark:text-text-dark"
                  numberOfLines={2}
                >
                  {typeof item === "string" ? item : item.label}
                </Text>
              </TouchableOpacity>
            )}
            style={{ flex: 1 }}
          />
        </SafeModalSheet>
      </View>
    </Modal>
  );
}
