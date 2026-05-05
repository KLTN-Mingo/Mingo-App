import TabBar from "@/components/shared/tabbar/TabBar";
import { colors } from "@/constants/designTokens";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

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

const FriendIcon = ({ color = colors.light[400], width = 22, height = 22 }) => (
  <Svg width={width} height={height} viewBox="0 0 12 12" fill="none">
    <Path
      d="M3 4a1 1 0 1 1 2 0a1 1 0 0 1-2 0m1-2a2 2 0 1 0 0 4a2 2 0 0 0 0-4m4 2.5a.5.5 0 1 1 1 0a.5.5 0 0 1-1 0M8.5 3a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3M1 8.25C1 7.56 1.56 7 2.25 7h3.5C6.44 7 7 7.56 7 8.25v.048a1 1 0 0 1-.008.109a2 2 0 0 1-.045.26a2.2 2.2 0 0 1-.355.768C6.168 10.018 5.378 10.5 4 10.5s-2.168-.482-2.592-1.065a2.2 2.2 0 0 1-.4-1.028L1 8.297zm1 .026l.002.027q.004.043.023.129c.027.113.082.264.192.415c.2.276.66.653 1.783.653s1.582-.377 1.783-.653A1.2 1.2 0 0 0 6 8.277V8.25A.25.25 0 0 0 5.75 8h-3.5a.25.25 0 0 0-.25.25zM8.499 10q-.531-.002-.933-.1a2.9 2.9 0 0 0 .383-.942q.232.04.55.042c.89 0 1.228-.272 1.36-.437a.7.7 0 0 0 .14-.316v-.005A.25.25 0 0 0 9.749 8H7.986a2.24 2.24 0 0 0-.365-1H9.75c.69 0 1.25.56 1.25 1.25v.017a1 1 0 0 1-.007.093a1.67 1.67 0 0 1-.352.827c-.369.46-1.03.813-2.141.813"
      fill={color}
    />
  </Svg>
);

const MessageIcon = ({ color = colors.light[400], width = 22, height = 22 }) => (
  <Svg width={width} height={height} viewBox="0 0 1024 1024" fill="none">
    <Path
      fill={color}
      d="M464 512a48 48 0 1 0 96 0a48 48 0 1 0-96 0m200 0a48 48 0 1 0 96 0a48 48 0 1 0-96 0m-400 0a48 48 0 1 0 96 0a48 48 0 1 0-96 0m661.2-173.6c-22.6-53.7-55-101.9-96.3-143.3a444.4 444.4 0 0 0-143.3-96.3C630.6 75.7 572.2 64 512 64h-2c-60.6.3-119.3 12.3-174.5 35.9a445.4 445.4 0 0 0-142 96.5c-40.9 41.3-73 89.3-95.2 142.8c-23 55.4-34.6 114.3-34.3 174.9A449.4 449.4 0 0 0 112 714v152a46 46 0 0 0 46 46h152.1A449.4 449.4 0 0 0 510 960h2.1c59.9 0 118-11.6 172.7-34.3a444.5 444.5 0 0 0 142.8-95.2c41.3-40.9 73.8-88.7 96.5-142c23.6-55.2 35.6-113.9 35.9-174.5c.3-60.9-11.5-120-34.8-175.6m-151.1 438C704 845.8 611 884 512 884h-1.7c-60.3-.3-120.2-15.3-173.1-43.5l-8.4-4.5H188V695.2l-4.5-8.4C155.3 633.9 140.3 574 140 513.7c-.4-99.7 37.7-193.3 107.6-263.8c69.8-70.5 163.1-109.5 262.8-109.9h1.7c50 0 98.5 9.7 144.2 28.9c44.6 18.7 84.6 45.6 119 80c34.3 34.3 61.3 74.4 80 119c19.4 46.2 29.1 95.2 28.9 145.8c-.6 99.6-39.7 192.9-110.1 262.7"
    />
  </Svg>
);

const ProfileIcon = ({ color = colors.light[400], width = 22, height = 22 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      fill="none"
      d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"
    />
    <Path
      fill={color}
      d="M20 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2H4v14h16zm-3 10a1 1 0 0 1 .117 1.993L17 17H7a1 1 0 0 1-.117-1.993L7 15zm-7-8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm7 4a1 1 0 1 1 0 2h-3a1 1 0 1 1 0-2zm-7-2H8v2h2zm7-2a1 1 0 0 1 .117 1.993L17 9h-3a1 1 0 0 1-.117-1.993L14 7z"
    />
  </Svg>
);

// ─── Tab Icon wrapper ──────────────────────────────────────────────────────────

const TabIcon = ({ SvgIcon, color }: { SvgIcon: any; color: string }) => (
  <View style={{ alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
    <SvgIcon color={color} />
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props:any) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false, // ✅ ẩn header tất cả screens
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => <TabIcon SvgIcon={HomeIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="friend"
        options={{
          title: "Bạn bè",
          tabBarIcon: ({ color }) => <TabIcon SvgIcon={FriendIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Đăng",
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Tin nhắn",
          tabBarIcon: ({ color }) => <TabIcon SvgIcon={MessageIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color }) => <TabIcon SvgIcon={ProfileIcon} color={color} />,
        }}
      />
     
    </Tabs>
  );
}
