import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Platform } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { colors } from "../../styles/colors";
import { getNotifications } from "@/lib/service/notification.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import Pusher from "pusher-js/react-native";
import { NotificationResponseDTO } from "@/dtos/NotificationDTO";
import NotificationCard from "@/components/card/notification/NotificationCard";

const PUSHER_APP_KEY = process.env.EXPO_PUBLIC_NEXT_PUBLIC_PUSHER_APP_KEY;

const Notification = () => {
  const { colorScheme } = useTheme();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponseDTO[]>(
    []
  );

  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.error("User is not authenticated");
          return;
        }

        const res = await getNotifications(token);
        if (isMounted && Array.isArray(res)) {
          setNotifications(res);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!profile?._id) return;

    const pusher = new Pusher(PUSHER_APP_KEY!, {
      cluster: "ap1",
      forceTLS: true,
    });

    const channelName = `notifications-${profile._id}`;
    const channel = pusher.subscribe(channelName);

    const handleNewNotification = (data: any) => {
      const newNotification = {
        ...data.notification,
        senderId: data.sender,
      };

      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === newNotification._id);
        if (exists) return prev;
        return [newNotification, ...prev];
      });
    };

    const handleDeletedNotification = (data: any) => {
      setNotifications((prev) =>
        prev.filter((n) => n._id !== data.notificationId)
      );
    };

    channel.bind("new-notification", handleNewNotification);
    channel.bind("notification-deleted", handleDeletedNotification);

    return () => {
      channel.unbind("new-notification", handleNewNotification);
      channel.unbind("notification-deleted", handleDeletedNotification);
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [profile?._id]);

  return (
    <View
      className="w-full p-4 h-full space-y-6"
      style={{
        paddingTop: Platform.OS === "android" ? 14 : 52,
        backgroundColor:
          colorScheme === "dark" ? colors.dark[500] : colors.light[500], // Sử dụng giá trị màu từ file colors.js
        flex: 1,
      }}
    >
      <View className="h-full w-fit">
        <View className="flex flex-row justify-between items-center pb-4">
          <View>
            <Text
              style={{
                fontSize: 24,
                color:
                  colorScheme === "dark" ? colors.dark[100] : colors.light[100],
              }}
              className="font-msemibold"
            ></Text>
          </View>
        </View>
        <ScrollView className="mb-20 space-y-2">
          {notifications.map((notification: any) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              profile={profile}
              setNotifications={setNotifications}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default Notification;
