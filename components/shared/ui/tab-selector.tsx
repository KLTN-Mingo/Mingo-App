import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

interface Tab {
  key: string;
  label: string;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (key: string) => void;
  colorScheme: "light" | "dark";
  colors: {
    primary: Record<number, string>;
    dark: Record<number, string>;
    light: Record<number, string>;
  };
}

const TabSelector: React.FC<TabSelectorProps> = ({
  tabs,
  activeTab,
  onTabPress,
  colorScheme,
  colors,
}) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.key;
        const textColor = isActive
          ? colors.primary[100]
          : colorScheme === "dark"
            ? colors.dark[300]
            : colors.light[300];

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            style={[styles.tabButton, index !== 0 && { marginLeft: 24 }]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: textColor,
                  borderBottomWidth: isActive ? 1.5 : 0,
                  borderBottomColor: isActive ? textColor : "transparent",
                },
              ]}
              className="font-mmedium text-[18px]"
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    paddingBottom: 2,
  },
});

export default TabSelector;
