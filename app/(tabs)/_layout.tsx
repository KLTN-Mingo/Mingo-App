import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { GlassTabBar } from "@/components/navigation/GlassTabBar";
import { FriendIcon, MessageIcon } from "@/components/shared/icons/Icons";
import { colors } from "@/constants/designTokens";

const TabIcon = ({ SvgIcon, color }: { SvgIcon: any; color: string }) => (
  <View
    style={{
      alignItems: "center",
      justifyContent: "center",
      width: 48,
      height: 32,
    }}
  >
    <SvgIcon color={color} />
  </View>
);

const HomeIcon = ({ color = "currentColor", width = 24, height = 24 }) => (
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
  color = "currentColor",
  width = 24,
  height = 24,
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

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary[100],
        tabBarInactiveTintColor: colors.dark[300],
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 4,
          height: "auto",
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
                <FriendIcon size={24} color={p.color} />
              )}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
        options={{
          title: "Đăng",
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Tin nhắn",
          tabBarIcon: ({ color }) => (
            <TabIcon
              SvgIcon={(p: { color: string }) => (
                <MessageIcon size={24} color={p.color} />
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
