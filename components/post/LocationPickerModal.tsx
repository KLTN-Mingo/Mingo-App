import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  TouchableOpacity,
  View,
} from "react-native";

import { CancelIcon } from "@/components/shared/icons/Icons";
import { SearchBarInput } from "@/components/shared/ui/search-bar";
import { Text } from "@/components/ui";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useVNLocationSuggestions } from "@/hooks/use-vn-locations";
import { paletteIcon } from "@/styles/colors";

interface LocationPickerModalProps {
  visible: boolean;
  initialValue?: string;
  onClose: () => void;
  onSelect: (locationName: string) => void;
}

export function LocationPickerModal({
  visible,
  initialValue,
  onClose,
  onSelect,
}: LocationPickerModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const iconColor =
    colorScheme === "dark" ? paletteIcon.dark : paletteIcon.light;
  const mutedIconColor = paletteIcon.lightMuted;

  const [query, setQuery] = useState("");
  const suggestions = useVNLocationSuggestions(query, 30);

  useEffect(() => {
    if (visible) {
      setQuery(initialValue ?? "");
    }
  }, [visible, initialValue]);

  const handlePick = (name: string) => {
    onSelect(name);
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
        <View className="rounded-t-[20px] bg-background-light dark:bg-background-dark px-4 pt-4 pb-6 max-h-[85%] min-h-[60%]">
          <View className="flex-row items-center mb-3">
            <Text className="flex-1 text-base font-semibold text-text-light dark:text-text-dark">
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
              placeholder="Search Vietnam locations..."
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          {initialValue ? (
            <TouchableOpacity
              onPress={handleClear}
              className="flex-row items-center py-3 px-1 mb-2"
              activeOpacity={0.65}
            >
              <Ionicons name="close-circle-outline" size={20} color={mutedIconColor} />
              <Text className="ml-2 text-sm text-text-muted-light dark:text-text-muted-dark">
                Remove location
              </Text>
            </TouchableOpacity>
          ) : null}

          <FlatList
            data={suggestions}
            keyExtractor={(it) => it.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View className="py-10 items-center">
                <Ionicons name="location-outline" size={28} color={mutedIconColor} />
                <Text variant="muted" className="mt-2 text-sm text-center">
                  {query.trim().length > 0
                    ? "No locations match your search"
                    : "Start typing to search"}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handlePick(item.shortLabel)}
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
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 420 }}
          />
        </View>
      </View>
    </Modal>
  );
}
