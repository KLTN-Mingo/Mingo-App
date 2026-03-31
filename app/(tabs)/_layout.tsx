
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { FriendIcon, MessageIcon } from "@/components/shared/icons/Icons";
import { colors } from "@/constants/designTokens";

// ─── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon = ({ color = colors.light[400], width = 22, height = 22 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.033 2.883a3 3 0 0 1 3.934 0l7 6.076A3 3 0 0 1 22 11.225V19a3 3 0 0 1-3 3h-3.5a1.5 1.5 0 0 1-1.5-1.5v-6.813h-4V20.5A1.5 1.5 0 0 1 8.5 22H5a3 3 0 0 1-3-3v-7.775a3 3 0 0 1 1.033-2.266zm2.623 1.51a1 1 0 0 0-1.312 0l-7 6.077a1 1 0 0 0-.344.755V19a1 1 0 0 0 1 1h3v-6.313a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V20h3a1 1 0 0 0 1-1v-7.775a1 1 0 0 0-.345-.755z"
    />
  </Svg>
);

const UserOutlineIcon = ({
  color = colors.light[400],
  width = 22,
  height = 22,
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5Z"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    />
  </Svg>
);

// ─── Tab Icon wrapper ──────────────────────────────────────────────────────────

const TabIcon = ({ SvgIcon, color }: { SvgIcon: any; color: string }) => (
  <View style={{ alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
    <SvgIcon color={color} />
  </View>
);

// ─── Layout ───────────────────────────────────────────────────────────────────

const BAR_HEIGHT = 64;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.light[400],
        tabBarInactiveTintColor: "rgba(255,255,255,0.45)",

        // The pill bar styling
        tabBarStyle: {
          // Position & size
          position: "absolute",
          bottom: 20,
          left: 40,
          right: 40,
          height: BAR_HEIGHT,

          // Pill shape
          borderRadius: 999,
          /** Trung tính charcoal (tránh rgba(22,22,35) tông xanh lạnh) */
          backgroundColor: "rgba(30, 32, 33, 0.94)",

          // Border / shadow
          borderTopWidth: 0,
          // borderWidth: 0.5,
          // borderColor: "rgba(255,255,255,0.10)",
          elevation: 24,
          shadowColor: colors.dark[500],
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 20,

          // Center items vertically
          paddingBottom: 0,
          paddingTop: 0,
          marginLeft: 20,
          marginRight: 20,
        },

        // Active tab indicator — small pill behind the active icon
        tabBarItemStyle: {
          borderRadius: 999,
          marginVertical: 10,
          marginHorizontal: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <TabIcon SvgIcon={HomeIcon} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friend"
        options={{
          title: "Bạn bè",
          tabBarIcon: ({ color }) => (
            <TabIcon
              SvgIcon={(p: { color: string }) => (
                <FriendIcon size={22} color={p.color} />
              )}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        listeners={{
          tabPress: (e) => e.preventDefault(),
        }}
        options={{
          title: "Đăng",
          tabBarIcon: ({ color }) => (
            // Plus button in the center
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                backgroundColor: colors.primary[100],
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 2,
                shadowColor: colors.primary[100],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 5v14M5 12h14"
                  stroke={colors.light[400]}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Tin nhắn",
          tabBarIcon: ({ color }) => (
            <TabIcon
              SvgIcon={(p: { color: string }) => (
                <MessageIcon size={22} color={p.color} />
              )}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color }) => (
            <TabIcon SvgIcon={UserOutlineIcon} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          href: null,
          title: "Notifications",
        }}
      />
    </Tabs>
  );
}
