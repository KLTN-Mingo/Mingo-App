import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";
// import { useTheme } from "../../context/ThemeContext";

const TabIcon = ({ SvgIcon, color, focused }: any) => {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        height: 36,
      }}
    >
      <SvgIcon color={color} focused={focused} />
    </View>
  );
};

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

const BellIcon = ({ color = "currentColor", width = 24, height = 24 }) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <Path
      fill={color}
      d="M8 17a.5.5 0 0 1 1 0a1 1 0 1 0 2 0a.5.5 0 0 1 1 0a2 2 0 1 1-4 0"
    />
    <Path
      fill={color}
      fillRule="evenodd"
      d="M17.5 14.5a2.96 2.96 0 0 0-1.5-2.575V9a5.5 5.5 0 0 0-5.5-5.5h-1A5.5 5.5 0 0 0 4 9v2.925A2.96 2.96 0 0 0 2.5 14.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2M15 12.558l.295.133l.055.024A1.96 1.96 0 0 1 16.5 14.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1c0-.769.45-1.467 1.15-1.784l.055-.025l.295-.133V9a4.5 4.5 0 0 1 4.5-4.5h1A4.5 4.5 0 0 1 15 9z"
      clipRule="evenodd"
    />
    <Path fill={color} d="M9.5 1.5a.5.5 0 0 1 1 0V4a.5.5 0 0 1-1 0z" />
  </Svg>
);

const PersonIcon = ({ color = "currentColor", width = 24, height = 24 }) => (
  <Svg width={width} height={height} viewBox="0 0 15 15" fill="none">
    <Path
      fill={color}
      d="M4 5.5a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0M5.5 3a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5m5 3a1 1 0 1 1 2 0a1 1 0 0 1-2 0m1-2a2 2 0 1 0 0 4a2 2 0 0 0 0-4m-10 6.5A1.5 1.5 0 0 1 3 9h5a1.5 1.5 0 0 1 1.5 1.5v.112a1 1 0 0 1-.01.137a2.85 2.85 0 0 1-.524 1.342C8.419 12.846 7.379 13.5 5.5 13.5s-2.918-.654-3.467-1.409a2.85 2.85 0 0 1-.523-1.342a2 2 0 0 1-.01-.137zm1 .09v.007l.004.049a1.85 1.85 0 0 0 .338.857c.326.448 1.036.997 2.658.997s2.332-.549 2.658-.997a1.85 1.85 0 0 0 .338-.857l.004-.05V10.5A.5.5 0 0 0 8 10H3a.5.5 0 0 0-.5.5zm9 1.91c-.588 0-1.07-.09-1.46-.238a4 4 0 0 0 .361-.932c.268.101.624.17 1.099.17c1.119 0 1.578-.382 1.78-.666a1.2 1.2 0 0 0 .218-.56l.002-.028a.25.25 0 0 0-.25-.246h-2.8A2.5 2.5 0 0 0 10 9h3.25c.69 0 1.25.56 1.25 1.25v.017a1 1 0 0 1-.008.109a2.2 2.2 0 0 1-.398 1.04c-.422.591-1.213 1.084-2.594 1.084"
    />
  </Svg>
);

const ProfileIcon = ({ color = "currentColor", width = 24, height = 24 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5Z"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    />
  </Svg>
);

const TabsLayout = () => {
  const { colorScheme } = useTheme();
  // const checkOnlineStatus = async () => {
  //   try {
  //     const userId = await AsyncStorage.getItem("userId");
  //     const result = await IsOnline(userId?.toString() || "");
  //     console.log("User online status:", result);
  //   } catch (error) {
  //     console.error("Error checking online status:", error);
  //   }
  // };

  // const setOfflineStatus = async () => {
  //   try {
  //     await IsOffline();
  //     console.log("User is offline");
  //   } catch (error) {
  //     console.error("Error setting offline status:", error);
  //   }
  // };

  // useEffect(() => {
  //   // Gọi `checkOnlineStatus` khi ở trong layout
  //   checkOnlineStatus();

  //   const appStateListener = AppState.addEventListener(
  //     "change",
  //     (nextAppState) => {
  //       if (nextAppState === "inactive") {
  //         setOfflineStatus(); // Người dùng ra khỏi app
  //       }
  //     }
  //   );

  //   return () => {
  //     appStateListener.remove(); // Cleanup listener on component unmount
  //     setOfflineStatus(); // Đặt trạng thái offline khi rời layout
  //   };
  // }, []);

  // useEffect(() => {
  //   const handleOnline = (data) => {
  //     console.log("Successfully received online-status:", data);
  //     setIsOnlineChat((prevState) => ({
  //       ...prevState,
  //       [data.userId]: true,
  //     }));
  //   };

  //   const handleOffline = (data) => {
  //     console.log("Successfully received offline-status:", data);
  //     setIsOnlineChat((prevState) => ({
  //       ...prevState,
  //       [data.userId]: false,
  //     }));
  //   };

  //   allChat.forEach((box) => {
  //     pusherClient.subscribe(`private-${box.receiverId}`);
  //     pusherClient.bind("online-status", handleOnline);
  //     pusherClient.bind("offline-status", handleOffline);
  //   });
  // });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#768D85",
        tabBarInactiveTintColor: colorScheme === "dark" ? "#A7AAA9" : "#1E2021",
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#1E1F1F" : "#FFFFFF",
          height: 68,
          paddingTop: 6,
          paddingBottom: 20,
          marginBottom: 20,
          borderTopWidth: 1,
          borderTopColor: colorScheme === "dark" ? "#323433" : "#ECEFEE",
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon SvgIcon={HomeIcon} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="friend"
        options={{
          title: "Friend",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon SvgIcon={PersonIcon} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon SvgIcon={BellIcon} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon SvgIcon={ProfileIcon} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
