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

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { useEffect } from 'react';
import { LayoutChangeEvent, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from "react-native-svg";

const HomeIcon = ({ color, width = 22, height = 22 }: any) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path fill={color} fillRule="evenodd" clipRule="evenodd"
      d="M10.033 2.883a3 3 0 0 1 3.934 0l7 6.076A3 3 0 0 1 22 11.225V19a3 3 0 0 1-3 3h-3.5a1.5 1.5 0 0 1-1.5-1.5v-6.813h-4V20.5A1.5 1.5 0 0 1 8.5 22H5a3 3 0 0 1-3-3v-7.775a3 3 0 0 1 1.033-2.266zm2.623 1.51a1 1 0 0 0-1.312 0l-7 6.077a1 1 0 0 0-.344.755V19a1 1 0 0 0 1 1h3v-6.313a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V20h3a1 1 0 0 0 1-1v-7.775a1 1 0 0 0-.345-.755z" />
  </Svg>
);

const FriendIcon = ({ color, width = 22, height = 22 }: any) => (
  <Svg width={width} height={height} viewBox="0 0 12 12" fill="none">
    <Path fill={color}
      d="M3 4a1 1 0 1 1 2 0a1 1 0 0 1-2 0m1-2a2 2 0 1 0 0 4a2 2 0 0 0 0-4m4 2.5a.5.5 0 1 1 1 0a.5.5 0 0 1-1 0M8.5 3a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3M1 8.25C1 7.56 1.56 7 2.25 7h3.5C6.44 7 7 7.56 7 8.25v.048a1 1 0 0 1-.008.109a2 2 0 0 1-.045.26a2.2 2.2 0 0 1-.355.768C6.168 10.018 5.378 10.5 4 10.5s-2.168-.482-2.592-1.065a2.2 2.2 0 0 1-.4-1.028L1 8.297zm1 .026l.002.027q.004.043.023.129c.027.113.082.264.192.415c.2.276.66.653 1.783.653s1.582-.377 1.783-.653A1.2 1.2 0 0 0 6 8.277V8.25A.25.25 0 0 0 5.75 8h-3.5a.25.25 0 0 0-.25.25zM8.499 10q-.531-.002-.933-.1a2.9 2.9 0 0 0 .383-.942q.232.04.55.042c.89 0 1.228-.272 1.36-.437a.7.7 0 0 0 .14-.316v-.005A.25.25 0 0 0 9.749 8H7.986a2.24 2.24 0 0 0-.365-1H9.75c.69 0 1.25.56 1.25 1.25v.017a1 1 0 0 1-.007.093a1.67 1.67 0 0 1-.352.827c-.369.46-1.03.813-2.141.813" />
  </Svg>
);

const MessageIcon = ({ color, width = 22, height = 22 }: any) => (
  <Svg width={width} height={height} viewBox="0 0 1024 1024" fill="none">
    <Path fill={color}
      d="M464 512a48 48 0 1 0 96 0a48 48 0 1 0-96 0m200 0a48 48 0 1 0 96 0a48 48 0 1 0-96 0m-400 0a48 48 0 1 0 96 0a48 48 0 1 0-96 0m661.2-173.6c-22.6-53.7-55-101.9-96.3-143.3a444.4 444.4 0 0 0-143.3-96.3C630.6 75.7 572.2 64 512 64h-2c-60.6.3-119.3 12.3-174.5 35.9a445.4 445.4 0 0 0-142 96.5c-40.9 41.3-73 89.3-95.2 142.8c-23 55.4-34.6 114.3-34.3 174.9A449.4 449.4 0 0 0 112 714v152a46 46 0 0 0 46 46h152.1A449.4 449.4 0 0 0 510 960h2.1c59.9 0 118-11.6 172.7-34.3a444.5 444.5 0 0 0 142.8-95.2c41.3-40.9 73.8-88.7 96.5-142c23.6-55.2 35.6-113.9 35.9-174.5c.3-60.9-11.5-120-34.8-175.6m-151.1 438C704 845.8 611 884 512 884h-1.7c-60.3-.3-120.2-15.3-173.1-43.5l-8.4-4.5H188V695.2l-4.5-8.4C155.3 633.9 140.3 574 140 513.7c-.4-99.7 37.7-193.3 107.6-263.8c69.8-70.5 163.1-109.5 262.8-109.9h1.7c50 0 98.5 9.7 144.2 28.9c44.6 18.7 84.6 45.6 119 80c34.3 34.3 61.3 74.4 80 119c19.4 46.2 29.1 95.2 28.9 145.8c-.6 99.6-39.7 192.9-110.1 262.7" />
  </Svg>
);

const ProfileIcon = ({ color, width = 22, height = 22 }: any) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 1.25a4.75 4.75 0 1 0 0 9.5a4.75 4.75 0 0 0 0-9.5M8.75 6a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0M12 12.25c-2.313 0-4.445.526-6.024 1.414C4.42 14.54 3.25 15.866 3.25 17.5v.102c-.001 1.162-.002 2.62 1.277 3.662c.629.512 1.51.877 2.7 1.117c1.192.242 2.747.369 4.773.369s3.58-.127 4.774-.369c1.19-.24 2.07-.605 2.7-1.117c1.279-1.042 1.277-2.5 1.276-3.662V17.5c0-1.634-1.17-2.96-2.725-3.836c-1.58-.888-3.711-1.414-6.025-1.414M4.75 17.5c0-.851.622-1.775 1.961-2.528c1.316-.74 3.184-1.222 5.29-1.222c2.104 0 3.972.482 5.288 1.222c1.34.753 1.961 1.677 1.961 2.528c0 1.308-.04 2.044-.724 2.6c-.37.302-.99.597-2.05.811c-1.057.214-2.502.339-4.476.339s-3.42-.125-4.476-.339c-1.06-.214-1.68-.509-2.05-.81c-.684-.557-.724-1.293-.724-2.601"
    />
  </Svg>
);

const PlusIcon = ({ color = '#fff', size = 28 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path fill={color} d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
  </Svg>
);

const SPACER_WIDTH = 64;
const INDICATOR_PADDING = 18;
const VISIBLE_TABS = ['home', 'friend', 'message', 'profile'];
const SPRING_CONFIG = { damping: 25, stiffness: 80 };

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#1E2021' : '#FFFFFF';
  const sheetColor = colorScheme === 'dark' ? '#252525' : '#FFFFFF';
  const plusColor = colorScheme === 'dark' ? '#EFE7DF' : '#1E2021';

  const routes = state.routes;
  const leftRoutes = routes.filter((r: any) => ['home', 'friend'].includes(r.name));
  const rightRoutes = routes.filter((r: any) => ['message', 'profile'].includes(r.name));

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
    VISIBLE_TABS.indexOf(routes[state.index]?.name ?? '')
  );

  // Sync active index from navigation state
  useEffect(() => {
    const route = routes[state.index];
    const idx = VISIBLE_TABS.indexOf(route?.name ?? '');
    if (idx >= 0) {
      activeIndexShared.value = idx;
    }
  }, [state.index, routes]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const totalW = tabbarWidthShared.value;
    if (totalW === 0) return { width: 0, height: 0, transform: [{ translateX: 0 }] };
    
    const bw = (totalW - SPACER_WIDTH) / 4; // ✅ width 1 tab
    const idx = activeIndexShared.value;
    
    const targetX = idx < 2
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
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const onLongPress = () => {
      navigation.emit({ type: 'tabLongPress', target: route.key });
    };

    const IconComponent = icons[route.name];
    const scale = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
      scale.value = withSpring(isFocused ? 1 : 0, SPRING_CONFIG);
    }, [isFocused]);

    const animatedTextStyle = useAnimatedStyle(() => ({
      opacity: interpolate(scale.value, [0, 1], [1, 0]),
    }));

    const animatedIconStyle = useAnimatedStyle(() => ({
      transform: [{ scale: interpolate(scale.value, [0, 1], [1, 1.2]) }],
      top: interpolate(scale.value, [0, 1], [0, 9]),
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
            <IconComponent color={isFocused ? '#EFE7DF' : colors.text} />
          )}
        </Animated.View>
        <Animated.Text style={[animatedTextStyle, {
          color: isFocused ? '#EFE7DF' : colors.text,
          fontSize: 12,
        }]}>
          {label}
        </Animated.Text>
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
              position: 'absolute',
              backgroundColor: '#768D85',
              borderRadius: 35,
              top: 8,
            },
          ]}
        />

        <View style={styles.side}>
          {leftRoutes.map((route: any) => <TabItem key={route.name} route={route} />)}
        </View>
        <View style={styles.centerSpacer} />
        <View style={styles.side}>
          {rightRoutes.map((route: any) => <TabItem key={route.name} route={route} />)}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.postButton, { backgroundColor: sheetColor }]}
        onPress={() => navigation.navigate('create-post')}
        activeOpacity={0.85}
      >
        <PlusIcon color={plusColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
    overflow: 'visible',
  },
  tabbar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  side: {
    flex: 1,
    flexDirection: 'row',
  },
  centerSpacer: {
    width: SPACER_WIDTH,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  postButton: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
});