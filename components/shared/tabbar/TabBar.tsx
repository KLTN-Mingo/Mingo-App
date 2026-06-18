import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import {
  getSemantic,
  paletteDark,
  paletteIcon,
  paletteLight,
} from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";

type TabRoute = BottomTabBarProps["state"]["routes"][number];
type IconProps = { color: string; width?: number; height?: number };
type TabItemProps = {
  route: TabRoute;
  descriptors: BottomTabBarProps["descriptors"];
  isFocused: boolean;
  navigation: BottomTabBarProps["navigation"];
  buildHref: ReturnType<typeof useLinkBuilder>["buildHref"];
  activeWidth: number;
  inactiveWidth: number;
  activeIconColor: string;
  inactiveIconColor: string;
  activeLabelColor: string;
};

const HomeIcon = ({ color, width = 22, height = 22 }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.07874 16.1354H14.8937"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.40002 13.713C2.40002 8.082 3.01402 8.475 6.31902 5.41C7.76502 4.246 10.015 2 11.958 2C13.9 2 16.195 4.235 17.654 5.41C20.959 8.475 21.572 8.082 21.572 13.713C21.572 22 19.613 22 11.986 22C4.35903 22 2.40002 22 2.40002 13.713Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FriendIcon = ({ color, width = 22, height = 22 }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.5918 13.957C12.8508 13.957 17.1838 14.324 17.1838 17.499C17.1838 20.84352 12.1349096 21.0441912 9.969206 21.0562315L9.1829025 21.0562358C6.8737376 21.0442632 1.9998 20.84472 1.9998 17.519C1.9998 14.17072 7.0486904 13.9698232 9.214394 13.9577694L9.4745932 13.9570285C9.5151456 13.957 9.55424 13.957 9.5918 13.957Z"
      fill={color}
    />
    <Path
      d="M9.5918 2C12.4228 2 14.7268505 4.304 14.7268505 7.135C14.7328 8.499 14.2038 9.787 13.2398 10.757C12.2778 11.728 10.9928 12.265 9.6258 12.27L9.5918 12.27C6.7598 12.27 4.4558 9.966 4.4558 7.135C4.4558 4.304 6.7598 2 9.5918 2Z"
      fill={color}
    />
    <Path
      d="M18.7065 13.4899C21.4125 13.8949 21.9795 15.1479 21.9795 16.1269C21.9795 16.8559 21.6645 17.8429 20.1615 18.4119C19.9845 18.4609 19.8925 18.4609 19.7955 18.4609C19.5925 18.4609 19.3075 18.2759 19.1945 17.9769C19.0475 17.5899 19.2425 17.1559 19.6295 17.0099C20.4795 16.6879 20.4795 16.2949 20.4795 16.1269C20.4795 15.5599 19.8085 15.1719 18.4855 14.9749C18.0755 14.9129 17.7925 14.5309 17.8535 14.1219C17.9155 13.7119 18.3045 13.4369 18.7065 13.4899Z"
      fill={color}
    />
    <Path
      d="M16.6794 3.1238C18.6444 3.4458 20.0704 5.1268 20.0704 7.1198C20.0664 9.1248 18.5694 10.8468 16.5874 11.1248C16.5524 11.1298 16.5174 11.1318 16.4824 11.1318C16.1144 11.1318 15.7934 10.8608 15.7404 10.4858C15.6834 10.0758 15.9684 9.6958 16.3784 9.6388C17.6264 9.4638 18.5684 8.3808 18.5704 7.1188C18.5704 5.8648 17.6724 4.8068 16.4374 4.6048C16.0284 4.5368 15.7514 4.1518 15.8184 3.7428C15.8854 3.3338 16.2724 3.0588 16.6794 3.1238Z"
      fill={color}
    />
  </Svg>
);

const MessageIcon = ({ color, width = 22, height = 22 }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.9393 12.413H15.9483"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11.9304 12.413H11.9394"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.9214 12.413H7.9304"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.071 19.0698C16.0159 22.1264 11.4896 22.7867 7.78631 21.074C7.23961 20.8539 3.70113 21.8339 2.93334 21.067C2.16555 20.2991 3.14639 16.7601 2.92631 16.2134C1.21285 12.5106 1.87411 7.9826 4.9302 4.9271C8.83147 1.0243 15.1698 1.0243 19.071 4.9271C22.9803 8.83593 22.9723 15.1681 19.071 19.0698Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ProfileIcon = ({ color, width = 22, height = 22 }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.9617 11.892H11.9927C14.8247 11.892 17.1287 9.58802 17.1287 6.75602C17.1287 3.92402 14.8247 1.61902 11.9927 1.61902C9.15975 1.61902 6.85575 3.92402 6.85575 6.75302C6.85075 8.12202 7.37975 9.41002 8.34375 10.381C9.30675 11.351 10.5917 11.888 11.9617 11.892ZM8.35575 6.75602C8.35575 4.75102 9.98775 3.11902 11.9927 3.11902C13.9977 3.11902 15.6287 4.75102 15.6287 6.75602C15.6287 8.76102 13.9977 10.392 11.9927 10.392H11.9647C10.9967 10.39 10.0897 10.01 9.40775 9.32302C8.72575 8.63702 8.35275 7.72602 8.35575 6.75602Z"
      fill={color}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.40552 18.7559C4.40552 22.3809 10.1215 22.3809 11.9995 22.3809C13.8775 22.3809 19.5945 22.3809 19.5945 18.7339C19.5945 15.9409 16.1165 13.5809 11.9995 13.5809C7.88352 13.5809 4.40552 15.9509 4.40552 18.7559ZM5.90552 18.7559C5.90552 17.0209 8.51152 15.0809 11.9995 15.0809C15.4885 15.0809 18.0945 17.0099 18.0945 18.7339C18.0945 20.1579 16.0435 20.8809 11.9995 20.8809C7.95652 20.1659 5.90552 20.1659 5.90552 18.7559Z"
      fill={color}
    />
  </Svg>
);

const PlusIcon = ({ color, size = 28 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path fill={color} d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
  </Svg>
);

const VISIBLE_TABS = ["home", "friend", "message", "profile"];
const TAB_BAR_BOTTOM_OFFSET = 18;
const TAB_BAR_HORIZONTAL_OFFSET = 20;
const TAB_BAR_HEIGHT = 62;
const POST_BUTTON_GAP = 8;
const TAB_BAR_INSET = 6;
const INACTIVE_TAB_WIDTH = 75;
const MIN_ACTIVE_TAB_WIDTH = 112;

function TabItem({
  route,
  descriptors,
  isFocused,
  navigation,
  buildHref,
  activeWidth,
  inactiveWidth,
  activeIconColor,
  inactiveIconColor,
  activeLabelColor,
}: TabItemProps) {
  const { options } = descriptors[route.key];
  const IconComponent =
    route.name === "home"
      ? HomeIcon
      : route.name === "friend"
        ? FriendIcon
        : route.name === "message"
          ? MessageIcon
          : route.name === "profile"
            ? ProfileIcon
            : null;
  const label =
    typeof options.title === "string"
      ? options.title
      : typeof options.tabBarLabel === "string"
        ? options.tabBarLabel
        : route.name;
  const itemWidth = useSharedValue(isFocused ? activeWidth : inactiveWidth);

  useEffect(() => {
    itemWidth.value = withTiming(isFocused ? activeWidth : inactiveWidth, {
      duration: 260,
    });
  }, [activeWidth, inactiveWidth, isFocused, itemWidth]);

  const itemAnimatedStyle = useAnimatedStyle(() => ({
    width: itemWidth.value,
  }));

  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const onLongPress = () => {
    navigation.emit({ type: "tabLongPress", target: route.key });
  };

  return (
    <Animated.View style={[styles.tabSlot, itemAnimatedStyle]}>
      <PlatformPressable
        href={buildHref(route.name, route.params)}
        accessibilityRole="tab"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarButtonTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tabItem}
      >
        {IconComponent ? (
          <IconComponent
            color={isFocused ? activeIconColor : inactiveIconColor}
            width={21}
            height={21}
          />
        ) : null}
        {isFocused ? (
          <Text
            style={[styles.activeLabel, { color: activeLabelColor }]}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : null}
      </PlatformPressable>
    </Animated.View>
  );
}

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { buildHref } = useLinkBuilder();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useTheme();
  const semantic = getSemantic(colorScheme);
  const isDark = colorScheme === "dark";
  const activeTabColor = semantic.primary;
  const barColor = semantic.surface;
  const barBorderColor = isDark
    ? paletteDark.borderAccent
    : paletteLight.borderSubtle;
  const activeIconColor = semantic.onPrimary;
  const inactiveIconColor = isDark ? paletteDark.textMuted : paletteIcon.lightMuted;
  const postButtonBackground = semantic.surfaceElevated;
  const shadowColor = isDark ? paletteDark.background : paletteDark.background;
  const shadowOpacity = isDark ? 0.32 : 0.22;
  const routes = state.routes;
  const visibleRoutes = routes.filter((route) =>
    VISIBLE_TABS.includes(route.name)
  );
  const bottom = Math.max(insets.bottom, TAB_BAR_BOTTOM_OFFSET);
  const [tabbarWidth, setTabbarWidth] = useState(0);
  const activeVisibleIndex = Math.max(
    visibleRoutes.findIndex((route) => route.key === routes[state.index]?.key),
    0
  );
  const inactiveWidth = INACTIVE_TAB_WIDTH;
  const activeWidth =
    visibleRoutes.length > 0
      ? Math.max(
          tabbarWidth -
            TAB_BAR_INSET * 2 -
            inactiveWidth * (visibleRoutes.length - 1),
          MIN_ACTIVE_TAB_WIDTH
        )
      : 0;
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    indicatorX.value = withTiming(activeVisibleIndex * inactiveWidth, {
      duration: 260,
    });
  }, [activeVisibleIndex, inactiveWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: activeWidth,
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleTabbarLayout = (event: LayoutChangeEvent) => {
    setTabbarWidth(event.nativeEvent.layout.width);
  };

  const renderTab = (route: TabRoute) => (
    <TabItem
      key={route.key}
      route={route}
      descriptors={descriptors}
      isFocused={state.index === routes.indexOf(route)}
      navigation={navigation}
      buildHref={buildHref}
      activeWidth={activeWidth}
      inactiveWidth={inactiveWidth}
      activeIconColor={activeIconColor}
      inactiveIconColor={inactiveIconColor}
      activeLabelColor={activeIconColor}
    />
  );

  return (
    <View
      style={[
        styles.wrapper,
        {
          bottom,
          paddingHorizontal: TAB_BAR_HORIZONTAL_OFFSET,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[
          styles.postButton,
          {
            bottom: TAB_BAR_HEIGHT + POST_BUTTON_GAP,
            right: TAB_BAR_HORIZONTAL_OFFSET,
            backgroundColor: postButtonBackground,
            borderColor: barBorderColor,
            shadowColor,
            shadowOpacity: isDark ? 0.28 : 0.2,
          },
        ]}
        onPress={() => navigation.navigate("create-post")}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Create post"
      >
        <PlusIcon color={activeTabColor} size={24} />
      </TouchableOpacity>
      <View
        style={[
          styles.tabbar,
          {
            backgroundColor: barColor,
            borderColor: barBorderColor,
            shadowColor,
            shadowOpacity,
          },
        ]}
        onLayout={handleTabbarLayout}
      >
        {activeWidth > 0 ? (
          <Animated.View
            style={[
              styles.activeIndicator,
              { backgroundColor: activeTabColor },
              indicatorStyle,
            ]}
          />
        ) : null}
        {visibleRoutes.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "flex-end",
    overflow: "visible",
    zIndex: 100,
    elevation: 100,
  },
  tabbar: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    height: TAB_BAR_HEIGHT,
    padding: TAB_BAR_INSET,
    borderRadius: 32,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 18,
  },
  activeIndicator: {
    position: "absolute",
    left: TAB_BAR_INSET,
    top: TAB_BAR_INSET,
    bottom: TAB_BAR_INSET,
    borderRadius: 25,
  },
  tabSlot: {
    height: 50,
    zIndex: 1,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    gap: 8,
  },
  activeLabel: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  postButton: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14,
    elevation: 20,
    zIndex: 10,
  },
});
