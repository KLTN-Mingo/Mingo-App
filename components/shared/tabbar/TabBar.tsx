import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder } from "@react-navigation/native";
import { useEffect } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import {
  paletteDark,
  paletteIcon,
  paletteLight,
  palettePrimary,
} from "@/constants/designTokens";

type TabRoute = BottomTabBarProps["state"]["routes"][number];
type IconProps = { color: string; width?: number; height?: number };
type TabItemProps = {
  route: TabRoute;
  descriptors: BottomTabBarProps["descriptors"];
  isFocused: boolean;
  activeTextColor: string;
  inactiveColor: string;
  activeIndexShared: SharedValue<number>;
  navigation: BottomTabBarProps["navigation"];
  buildHref: ReturnType<typeof useLinkBuilder>["buildHref"];
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
    <Path d="M15.9393 12.413H15.9483" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M11.9304 12.413H11.9394" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7.9214 12.413H7.9304" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

const SPACER_WIDTH = 64;
const INDICATOR_PADDING = 18;
const VISIBLE_TABS = ["home", "friend", "message", "profile"];
const SPRING_CONFIG = { damping: 25, stiffness: 80 };
const ACTIVE_ICON_DARK = paletteDark.background;

function TabItem({
  route,
  descriptors,
  isFocused,
  activeTextColor,
  inactiveColor,
  activeIndexShared,
  navigation,
  buildHref,
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
  const scale = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, SPRING_CONFIG);
  }, [isFocused, scale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scale.value, [0, 1], [1, 1.1]) }],
  }));

  const onPress = () => {
    const index = VISIBLE_TABS.indexOf(route.name);
    if (index >= 0) activeIndexShared.value = index;
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
      <Animated.View style={animatedIconStyle}>
        {IconComponent ? (
          <IconComponent
            color={isFocused ? activeTextColor : inactiveColor}
            width={20}
            height={20}
          />
        ) : null}
      </Animated.View>
    </PlatformPressable>
  );
}

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { buildHref } = useLinkBuilder();
  const colorScheme = useColorScheme() ?? "light";
  const backgroundColor =
    colorScheme === "dark" ? paletteDark.background : paletteLight.background;
  const sheetColor =
    colorScheme === "dark" ? paletteDark.surface : paletteLight.background;
  const plusColor =
    colorScheme === "dark" ? paletteDark.textPrimary : paletteLight.textPrimary;
  const inactiveColor = paletteIcon.lightMuted;
  const activeTextColor =
    colorScheme === "dark" ? ACTIVE_ICON_DARK : paletteLight.white;
  const routes = state.routes;
  const leftRoutes = routes.filter((route) =>
    ["home", "friend"].includes(route.name)
  );
  const rightRoutes = routes.filter((route) =>
    ["message", "profile"].includes(route.name)
  );
  const tabbarWidthShared = useSharedValue(0);
  const tabbarHeightShared = useSharedValue(0);
  const activeIndexShared = useSharedValue(
    VISIBLE_TABS.indexOf(routes[state.index]?.name ?? "")
  );

  useEffect(() => {
    const route = routes[state.index];
    const index = VISIBLE_TABS.indexOf(route?.name ?? "");
    if (index >= 0) activeIndexShared.value = index;
  }, [activeIndexShared, routes, state.index]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const totalWidth = tabbarWidthShared.value;
    if (totalWidth === 0) {
      return { width: 0, height: 0, transform: [{ translateX: 0 }] };
    }
    const buttonWidth = (totalWidth - SPACER_WIDTH) / 4;
    const index = activeIndexShared.value;
    const targetX =
      index < 2
        ? index * buttonWidth + INDICATOR_PADDING
        : index * buttonWidth + SPACER_WIDTH + INDICATOR_PADDING;

    return {
      width: buttonWidth - INDICATOR_PADDING * 2,
      height: tabbarHeightShared.value > 0 ? tabbarHeightShared.value - 16 : 0,
      transform: [{ translateX: withSpring(targetX, SPRING_CONFIG) }],
    };
  });

  const renderTab = (route: TabRoute) => (
    <TabItem
      key={route.key}
      route={route}
      descriptors={descriptors}
      isFocused={state.index === routes.indexOf(route)}
      activeTextColor={activeTextColor}
      inactiveColor={inactiveColor}
      activeIndexShared={activeIndexShared}
      navigation={navigation}
      buildHref={buildHref}
    />
  );

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View
        style={[
          styles.tabbarShadow,
          { backgroundColor, shadowColor: paletteDark.background },
        ]}
      >
        <View
          style={[styles.tabbar, { backgroundColor }]}
          onLayout={(event: LayoutChangeEvent) => {
            tabbarWidthShared.value = event.nativeEvent.layout.width;
            tabbarHeightShared.value = event.nativeEvent.layout.height;
          }}
        >
          <Animated.View
            style={[
              styles.indicator,
              { backgroundColor: palettePrimary[500] },
              animatedIndicatorStyle,
            ]}
          />
          <View style={styles.side}>{leftRoutes.map(renderTab)}</View>
          <View style={styles.centerSpacer} />
          <View style={styles.side}>{rightRoutes.map(renderTab)}</View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.postButton,
          { backgroundColor: sheetColor, shadowColor: paletteDark.background },
        ]}
        onPress={() => navigation.navigate("create-post")}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Create post"
      >
        <PlusIcon color={plusColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: "center",
    overflow: "visible",
  },
  tabbar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 35,
    overflow: "hidden",
  },
  tabbarShadow: {
    width: "100%",
    borderRadius: 35,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 18,
  },
  indicator: {
    position: "absolute",
    borderRadius: 35,
    top: 8,
  },
  side: {
    flex: 1,
    flexDirection: "row",
  },
  centerSpacer: {
    width: SPACER_WIDTH,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 44,
    paddingVertical: 4,
  },
  postButton: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
});
