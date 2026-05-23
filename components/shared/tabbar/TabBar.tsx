// import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
// import { PlatformPressable } from '@react-navigation/elements';
// import { useLinkBuilder, useTheme } from '@react-navigation/native';
// import { useEffect, useState } from 'react';
// import { LayoutChangeEvent, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
// import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
// import Svg, { Path } from "react-native-svg";

// const HomeIcon = ({ color, width = 22, height = 22 }: any) => (
//   <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
//     <Path fill={color} fillRule="evenodd" clipRule="evenodd"
//       d="M10.033 2.883a3 3 0 0 1 3.934 0l7 6.076A3 3 0 0 1 22 11.225V19a3 3 0 0 1-3 3h-3.5a1.5 1.5 0 0 1-1.5-1.5v-6.813h-4V20.5A1.5 1.5 0 0 1 8.5 22H5a3 3 0 0 1-3-3v-7.775a3 3 0 0 1 1.033-2.266zm2.623 1.51a1 1 0 0 0-1.312 0l-7 6.077a1 1 0 0 0-.344.755V19a1 1 0 0 0 1 1h3v-6.313a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V20h3a1 1 0 0 0 1-1v-7.775a1 1 0 0 0-.345-.755z" />
//   </Svg>
// );

// const FriendIcon = ({ color, width = 22, height = 22 }: any) => (
//   <Svg width={width} height={height} viewBox="0 0 12 12" fill="none">
//     <Path fill={color}
//       d="M3 4a1 1 0 1 1 2 0a1 1 0 0 1-2 0m1-2a2 2 0 1 0 0 4a2 2 0 0 0 0-4m4 2.5a.5.5 0 1 1 1 0a.5.5 0 0 1-1 0M8.5 3a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3M1 8.25C1 7.56 1.56 7 2.25 7h3.5C6.44 7 7 7.56 7 8.25v.048a1 1 0 0 1-.008.109a2 2 0 0 1-.045.26a2.2 2.2 0 0 1-.355.768C6.168 10.018 5.378 10.5 4 10.5s-2.168-.482-2.592-1.065a2.2 2.2 0 0 1-.4-1.028L1 8.297zm1 .026l.002.027q.004.043.023.129c.027.113.082.264.192.415c.2.276.66.653 1.783.653s1.582-.377 1.783-.653A1.2 1.2 0 0 0 6 8.277V8.25A.25.25 0 0 0 5.75 8h-3.5a.25.25 0 0 0-.25.25zM8.499 10q-.531-.002-.933-.1a2.9 2.9 0 0 0 .383-.942q.232.04.55.042c.89 0 1.228-.272 1.36-.437a.7.7 0 0 0 .14-.316v-.005A.25.25 0 0 0 9.749 8H7.986a2.24 2.24 0 0 0-.365-1H9.75c.69 0 1.25.56 1.25 1.25v.017a1 1 0 0 1-.007.093a1.67 1.67 0 0 1-.352.827c-.369.46-1.03.813-2.141.813" />
//   </Svg>
// );

// const MessageIcon = ({ color, width = 22, height = 22 }: any) => (
//   <Svg width={width} height={height} viewBox="0 0 1024 1024" fill="none">
//     <Path fill={color}
//       d="M464 512a48 48 0 1 0 96 0a48 48 0 1 0-96 0m200 0a48 48 0 1 0 96 0a48 48 0 1 0-96 0m-400 0a48 48 0 1 0 96 0a48 48 0 1 0-96 0m661.2-173.6c-22.6-53.7-55-101.9-96.3-143.3a444.4 444.4 0 0 0-143.3-96.3C630.6 75.7 572.2 64 512 64h-2c-60.6.3-119.3 12.3-174.5 35.9a445.4 445.4 0 0 0-142 96.5c-40.9 41.3-73 89.3-95.2 142.8c-23 55.4-34.6 114.3-34.3 174.9A449.4 449.4 0 0 0 112 714v152a46 46 0 0 0 46 46h152.1A449.4 449.4 0 0 0 510 960h2.1c59.9 0 118-11.6 172.7-34.3a444.5 444.5 0 0 0 142.8-95.2c41.3-40.9 73.8-88.7 96.5-142c23.6-55.2 35.6-113.9 35.9-174.5c.3-60.9-11.5-120-34.8-175.6m-151.1 438C704 845.8 611 884 512 884h-1.7c-60.3-.3-120.2-15.3-173.1-43.5l-8.4-4.5H188V695.2l-4.5-8.4C155.3 633.9 140.3 574 140 513.7c-.4-99.7 37.7-193.3 107.6-263.8c69.8-70.5 163.1-109.5 262.8-109.9h1.7c50 0 98.5 9.7 144.2 28.9c44.6 18.7 84.6 45.6 119 80c34.3 34.3 61.3 74.4 80 119c19.4 46.2 29.1 95.2 28.9 145.8c-.6 99.6-39.7 192.9-110.1 262.7" />
//   </Svg>
// );

// const ProfileIcon = ({ color, width = 22, height = 22 }: any) => (
//   <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
//     <Path fill="none" d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
//     <Path fill={color} d="M20 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2H4v14h16zm-3 10a1 1 0 0 1 .117 1.993L17 17H7a1 1 0 0 1-.117-1.993L7 15zm-7-8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm7 4a1 1 0 1 1 0 2h-3a1 1 0 1 1 0-2zm-7-2H8v2h2zm7-2a1 1 0 0 1 .117 1.993L17 9h-3a1 1 0 0 1-.117-1.993L14 7z" />
//   </Svg>
// );

// const PlusIcon = ({ color = '#fff', size = 28 }: any) => (
//   <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
//     <Path fill={color} d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
//   </Svg>
// );

// export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
//   const { colors } = useTheme();
//   const { buildHref } = useLinkBuilder();
//   const colorScheme = useColorScheme();
//   const backgroundColor = colorScheme === 'dark' ? '#1E2021' : '#FFFFFF';
//   const sheetColor = colorScheme === 'dark' ? '#252525' : '#FFFFFF';

//   const routes = state.routes;

//   const leftRoutes = routes.filter((r: any) => ['home', 'friend'].includes(r.name));
//   const rightRoutes = routes.filter((r: any) => ['message', 'profile'].includes(r.name));

//   const icons: Record<string, any> = {
//     home: HomeIcon,
//     friend: FriendIcon,
//     message: MessageIcon,
//     profile: ProfileIcon,
//   };

//   const renderTab = (route: any) => {
//     const { options } = descriptors[route.key];
//     const label = options.title ?? route.name;
//     const isFocused = state.index === routes.indexOf(route);

//     const onPress = () => {
//       tabPositionX.value = withSpring(getTabPositionX(route.name), { duration: 350 });
//       const event = navigation.emit({
//         type: 'tabPress',
//         target: route.key,
//         canPreventDefault: true,
//       });
//       if (!isFocused && !event.defaultPrevented) {
//         navigation.navigate(route.name, route.params);
//       }
//     };

//     const onLongPress = () => {
//       navigation.emit({ type: 'tabLongPress', target: route.key });
//     };

//     const IconComponent = icons[route.name];

//     const scale = useSharedValue(0);
//     useEffect(() => {
//       scale.value = withSpring (typeof isFocused==='boolean' ? (isFocused ? 1 : 0) : isFocused,
//     {
//       duration: 350,
//     }
//     );
//     }, [scale, isFocused]);

//     const animatedTextStyle = useAnimatedStyle(() => {
//       const opacity = interpolate(scale.value, [0, 1], [1, 0]);
//       return {
//         opacity,
//       };
//     });

//     const animatedIconStyle = useAnimatedStyle(() => {
//       const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);

//       const top = interpolate(scale.value, [0, 1], [0, 9]);
//       return {
//         transform: [{ scale: scaleValue }],
//         top
//       };
//     });

//     return (
//       <PlatformPressable
//         key={route.name}
//         href={buildHref(route.name, route.params)}
//         accessibilityState={isFocused ? { selected: true } : {}}
//         accessibilityLabel={options.tabBarAccessibilityLabel}
//         testID={options.tabBarButtonTestID}
//         onPress={onPress}
//         onLongPress={onLongPress}
//         style={styles.tabItem}
//       >
//         <Animated.View style={animatedIconStyle}>
//         {IconComponent && (
//           <IconComponent color={isFocused ? '#EFE7DF' : colors.text} />
//         )}
//         </Animated.View>

//         <Animated.Text style={[animatedTextStyle, { color: isFocused ? '#EFE7DF' : colors.text, fontSize: 12 }]}>
//           {label}
//         </Animated.Text>
//       </PlatformPressable>
//     );
//   };

//   const [demension, setDemension] = useState({ width: 20, height: 100 });

//   // const buttonWidth = demension.width / state.routes.length;
//   const SPACER_WIDTH = 64;
//   const buttonWidth = demension.width > 0
//     ? (demension.width - SPACER_WIDTH) / 4
//     : 0;

//   const onTabbarLayout = (event: LayoutChangeEvent) => {
//     setDemension({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height });
//   };

//   const getTabPositionX = (routeName: string) => {
//     const visibleNames = ['home', 'friend', 'message', 'profile'];
//     const index = visibleNames.indexOf(routeName);
//     if (index < 2) {
//       return index * buttonWidth;
//     }
//     return index * buttonWidth + SPACER_WIDTH;
//   };

//   const tabPositionX = useSharedValue(0);

//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ translateX: tabPositionX.value }],
//     };
//   });

//   return (
//     <View style={styles.wrapper}>

//       <View  onLayout={onTabbarLayout} style={[styles.tabbar, { backgroundColor }]}>
//       <Animated.View style={[animatedStyle, {
//         position: 'absolute',
//         backgroundColor: '#768D85',
//         borderRadius: 35,
//         marginHorizontal: 12,
//         height: demension.height -15,
//         width: buttonWidth - 25,
//       }]}></Animated.View>
//         <View style={styles.side}>
//           {leftRoutes.map(renderTab)}
//         </View>

//         <View style={styles.centerSpacer} />

//         <View style={styles.side}>
//           {rightRoutes.map(renderTab)}
//         </View>
//       </View>

//       <TouchableOpacity
//         style={[styles.postButton, { backgroundColor: sheetColor }]}
//         onPress={() => navigation.navigate('create-post')}
//         activeOpacity={0.85}
//       >
//         <PlusIcon />
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     position: 'absolute',
//     bottom: 30,
//     left: 20,
//     right: 20,
//     alignItems: 'center',
//     overflow: 'visible',
//   },
//   tabbar: {
//     width: '100%',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderRadius: 35,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//     overflow: 'visible',
//   },
//   side: {
//     flex: 1,
//     flexDirection: 'row',
//   },
//   centerSpacer: {
//     width: 64,
//   },
//   tabItem: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 4,
//     paddingVertical: 4,
//   },
//   postButton: {
//     position: 'absolute',
//     top: -10,
//     alignSelf: 'center',
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#768D85',
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 8,
//     zIndex: 10,
//   },
// });

import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
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
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const HomeIcon = ({ color, width = 22, height = 22 }: any) => (
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

const FriendIcon = ({ color, width = 22, height = 22 }: any) => (
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

const MessageIcon = ({ color, width = 22, height = 22 }: any) => (
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

const ProfileIcon = ({ color, width = 22, height = 22 }: any) => (
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

const PlusIcon = ({ color = "#fff", size = 28 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path fill={color} d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
  </Svg>
);

const SPACER_WIDTH = 64;
const INDICATOR_PADDING = 18;
const VISIBLE_TABS = ["home", "friend", "message", "profile"];
const SPRING_CONFIG = { damping: 25, stiffness: 80 };

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors: navColors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === "dark" ? "#1E2021" : "#FFFFFF";
  const sheetColor = colorScheme === "dark" ? "#252525" : "#FFFFFF";
  const plusColor = colorScheme === "dark" ? "#FAFAFA" : "#1E2021";
  const inactiveColor = "#6B6B6B";
  const activeTextColor = colorScheme === "dark" ? "#1E2021" : "#FFFFFF";

  const routes = state.routes;
  const leftRoutes = routes.filter((r: any) =>
    ["home", "friend"].includes(r.name)
  );
  const rightRoutes = routes.filter((r: any) =>
    ["message", "profile"].includes(r.name)
  );

  const icons: Record<string, any> = {
    home: HomeIcon,
    friend: FriendIcon,
    message: MessageIcon,
    profile: ProfileIcon,
  };

  // Shared values instead of state for smooth animation
  const tabbarWidthShared = useSharedValue(0);
  const tabbarHeightShared = useSharedValue(0);
  const activeIndexShared = useSharedValue(
    VISIBLE_TABS.indexOf(routes[state.index]?.name ?? "")
  );

  // Sync active index from navigation state
  useEffect(() => {
    const route = routes[state.index];
    const idx = VISIBLE_TABS.indexOf(route?.name ?? "");
    if (idx >= 0) {
      activeIndexShared.value = idx;
    }
  }, [state.index, routes]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const totalW = tabbarWidthShared.value;
    if (totalW === 0)
      return { width: 0, height: 0, transform: [{ translateX: 0 }] };

    const bw = (totalW - SPACER_WIDTH) / 4; // ✅ width 1 tab
    const idx = activeIndexShared.value;

    const targetX =
      idx < 2
        ? idx * bw + INDICATOR_PADDING
        : idx * bw + SPACER_WIDTH + INDICATOR_PADDING;

    return {
      width: bw - INDICATOR_PADDING * 2,
      height: tabbarHeightShared.value > 0 ? tabbarHeightShared.value - 16 : 0,
      transform: [{ translateX: withSpring(targetX, SPRING_CONFIG) }],
    };
  });

  const TabItem = ({ route }: { route: any }) => {
    const { options } = descriptors[route.key];
    const label = options.title ?? route.name;
    const isFocused = state.index === routes.indexOf(route);

    const onPress = () => {
      const idx = VISIBLE_TABS.indexOf(route.name);
      if (idx >= 0) {
        activeIndexShared.value = idx;
      }
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

    const IconComponent = icons[route.name];
    const scale = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
      scale.value = withSpring(isFocused ? 1 : 0, SPRING_CONFIG);
    }, [isFocused]);

    const animatedTextStyle = useAnimatedStyle(() => ({
      opacity: 1,
    }));

    const animatedIconStyle = useAnimatedStyle(() => ({
      transform: [{ scale: interpolate(scale.value, [0, 1], [1, 1.1]) }],
    }));

    return (
      <PlatformPressable
        key={route.name}
        href={buildHref(route.name, route.params)}
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarButtonTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tabItem}
      >
        <Animated.View style={animatedIconStyle}>
          {IconComponent && (
            <IconComponent
              color={isFocused ? activeTextColor : inactiveColor}
              width={20}
              height={20}
            />
          )}
        </Animated.View>
        {/* <Animated.Text
          numberOfLines={1}
          style={[
            animatedTextStyle,
            {
              color: isFocused ? activeTextColor : inactiveColor,
              fontSize: 11,
              fontFamily: "Montserrat-Regular",
              marginTop: 2,
            },
          ]}
        >
          {label}
        </Animated.Text> */}
      </PlatformPressable>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.tabbar, { backgroundColor }]}
        onLayout={(e: LayoutChangeEvent) => {
          tabbarWidthShared.value = e.nativeEvent.layout.width;
          tabbarHeightShared.value = e.nativeEvent.layout.height;
        }}
      >
        <Animated.View
          style={[
            animatedIndicatorStyle,
            {
              position: "absolute",
              backgroundColor: "#768D85",
              borderRadius: 35,
              top: 8,
            },
          ]}
        />

        <View style={styles.side}>
          {leftRoutes.map((route: any) => (
            <TabItem key={route.name} route={route} />
          ))}
        </View>
        <View style={styles.centerSpacer} />
        <View style={styles.side}>
          {rightRoutes.map((route: any) => (
            <TabItem key={route.name} route={route} />
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.postButton, { backgroundColor: sheetColor }]}
        onPress={() => navigation.navigate("create-post")}
        activeOpacity={0.85}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: "hidden",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
});
