import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { FriendIcon, MessageIcon } from "@/components/shared/icons/Icons";
import { colors } from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";

const H_MARGIN = 20;
const PILL_RADIUS = 28;
const ROW_HEIGHT = 52;

const TAB_ORDER = [
  "home",
  "friend",
  "post",
  "message",
  "profile",
] as const;

const a11yLabels: Record<string, string> = {
  home: "Trang chủ",
  friend: "Bạn bè",
  post: "Tạo bài viết",
  message: "Tin nhắn",
  profile: "Hồ sơ",
};

const HomeIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.033 2.883a3 3 0 0 1 3.934 0l7 6.076A3 3 0 0 1 22 11.225V19a3 3 0 0 1-3 3h-3.5a1.5 1.5 0 0 1-1.5-1.5v-6.813h-4V20.5A1.5 1.5 0 0 1 8.5 22H5a3 3 0 0 1-3-3v-7.775a3 3 0 0 1 1.033-2.266zm2.623 1.51a1 1 0 0 0-1.312 0l-7 6.077a1 1 0 0 0-.344.755V19a1 1 0 0 0 1 1h3v-6.313a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V20h3a1 1 0 0 0 1-1v-7.775a1 1 0 0 0-.345-.755z"
    />
  </Svg>
);

const UserOutlineIcon = ({
  color,
  size = 24,
}: {
  color: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5Z"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    />
  </Svg>
);

function renderIcon(
  routeName: string,
  focused: boolean,
  isDark: boolean
): React.ReactNode {
  const tint = focused ? colors.primary[100] : colors.dark[300];
  const tintLight = focused ? colors.primary[100] : colors.light[300];

  switch (routeName) {
    case "home":
      return <HomeIcon color={isDark ? tint : tintLight} size={24} />;
    case "friend":
      return <FriendIcon size={24} color={isDark ? tint : tintLight} />;
    case "post":
      return isDark ? (
        <Text style={styles.plus} allowFontScaling={false}>
          +
        </Text>
      ) : (
        <View style={styles.plusBadge}>
          <Text style={styles.plusOnPrimary} allowFontScaling={false}>
            +
          </Text>
        </View>
      );
    case "message":
      return <MessageIcon size={24} color={isDark ? tint : tintLight} />;
    case "profile":
      return <UserOutlineIcon color={isDark ? tint : tintLight} size={24} />;
    default:
      return null;
  }
}

/**
 * Pressable trên RN/iOS hay KHÔNG áp flex:1 đúng → icon dồn trái.
 * Luôn dùng width pixel = pillWidth / 5 cho đúng 5 cột.
 */
export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  const pillWidth = Math.max(0, windowWidth - H_MARGIN * 2);
  const baseSlot = Math.floor(pillWidth / 5);
  const remainder = pillWidth - baseSlot * 5;
  /** 5 ô: vài ô đầu +1px nếu chia không hết */
  const slotWidthForIndex = (i: number) =>
    baseSlot + (i < remainder ? 1 : 0);

  const bottomPad = Math.max(insets.bottom, 8);

  const routeByName = useMemo(() => {
    const m = new Map<string, (typeof state.routes)[0]>();
    for (const r of state.routes) {
      m.set(r.name, r);
    }
    return m;
  }, [state.routes]);

  const activeKey = state.routes[state.index]?.key;

  const slotShell = (key: string, slotW: number, child: React.ReactNode) => (
    <View
      key={key}
      style={[
        styles.slotShell,
        {
          width: slotW,
          minWidth: slotW,
          maxWidth: slotW,
          height: ROW_HEIGHT,
        },
      ]}
      collapsable={false}
    >
      {child}
    </View>
  );

  const rowChildren = TAB_ORDER.map((name, index) => {
    const slotW = slotWidthForIndex(index);
    const route = routeByName.get(name);
    if (!route) {
      return slotShell(name, slotW, null);
    }

    const focused = route.key === activeKey;
    const a11y = a11yLabels[name] ?? name;

    const onPress = () => {
      if (name === "post") {
        router.push("/create-post");
        return;
      }
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name as never);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: "tabLongPress",
        target: route.key,
      });
    };

    /** View cố định width — Pressable đôi khi bỏ qua width trên RN/Web → icon dồn trái */
    return slotShell(
      route.key,
      slotW,
      <Pressable
        accessibilityRole="button"
        accessibilityState={focused ? { selected: true } : {}}
        accessibilityLabel={a11y}
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.slotPressable,
          pressed && styles.tabPressed,
        ]}
      >
        <View style={styles.iconWrap}>
          {renderIcon(name, focused, isDark)}
        </View>
      </Pressable>
    );
  });

  const pillBody = (
    <View
      style={[
        styles.rowTrack,
        {
          width: pillWidth,
          minWidth: pillWidth,
          height: ROW_HEIGHT,
        },
      ]}
    >
      {rowChildren}
    </View>
  );

  const pillChrome = (
    <View
      style={[
        styles.pillOuter,
        {
          width: pillWidth,
          height: ROW_HEIGHT,
          borderRadius: PILL_RADIUS,
        },
        Platform.OS === "ios"
          ? styles.pillIosClear
          : isDark
            ? styles.pillDark
            : styles.pillLight,
      ]}
    >
      {Platform.OS === "ios" ? (
        <>
          <BlurView
            intensity={isDark ? 36 : 50}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.pillForeground} pointerEvents="box-none">
            {pillBody}
          </View>
        </>
      ) : (
        pillBody
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.screenWidthBar,
        {
          width: windowWidth,
          paddingBottom: bottomPad,
        },
      ]}
    >
      <View style={styles.pillCenter}>{pillChrome}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWidthBar: {
    alignSelf: "stretch",
    backgroundColor: "transparent",
  },
  pillCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  pillOuter: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(207, 191, 173, 0.28)",
    ...Platform.select({
      android: {
        elevation: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
      default: {},
    }),
  },
  pillIosClear: {
    backgroundColor: "transparent",
  },
  pillDark: {
    backgroundColor: "rgba(30, 32, 33, 0.94)",
  },
  pillLight: {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
  },
  pillForeground: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "stretch",
    justifyContent: "center",
  },
  rowTrack: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    flexShrink: 0,
  },
  slotShell: {
    flexShrink: 0,
    flexGrow: 0,
    overflow: "hidden",
  },
  slotPressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  tabPressed: {
    opacity: 0.85,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Montserrat-Medium",
    lineHeight: 30,
    includeFontPadding: false,
  },
  plusBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
  },
  plusOnPrimary: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Montserrat-SemiBold",
    includeFontPadding: false,
  },
});
