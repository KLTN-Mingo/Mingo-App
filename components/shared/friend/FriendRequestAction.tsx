import Button from "@/components/shared/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { NotificationResponseDTO } from "@/dtos/NotificationDTO";
import {
  acceptAddFriend,
  unfollowOrRefuseFriendRequest,
} from "@/lib/service/friend.service";
import {
  createNotification,
  deleteNotification,
  getNotification,
} from "@/lib/service/notification.service";
import { colors } from "@/styles/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { View } from "react-native";

interface FriendRequestActionProps {
  senderId: string;
  receiverId: string;
  setNotifications?: React.Dispatch<
    React.SetStateAction<NotificationResponseDTO[]>
  >;
}

const FriendRequestAction: React.FC<FriendRequestActionProps> = ({
  senderId,
  receiverId,
  setNotifications,
}: FriendRequestActionProps) => {
  const { colorScheme } = useTheme();
  const handleRefuseFriend = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        alert("Bạn cần đăng nhập để thực hiện hành động này.");
        return;
      }

      const notification = await getNotification(
        senderId,
        receiverId,
        "friend_request"
      );

      if (!notification || !notification._id) {
        console.warn("Không tìm thấy thông báo cần xoá.");
        return;
      }

      await unfollowOrRefuseFriendRequest(
        {
          sender: senderId,
          receiver: receiverId,
        },
        token
      );

      await deleteNotification(notification._id, token);

      setNotifications?.((prevNotifications) =>
        prevNotifications.filter((notif) => notif._id !== notification._id)
      );
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Đã xảy ra lỗi.");
    }
  };

  const handleAcceptFriend = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        alert("Bạn cần đăng nhập để thực hiện hành động này.");
        return;
      }

      const notification = await getNotification(
        senderId,
        receiverId,
        "friend_request"
      );

      if (!notification || !notification._id) {
        console.warn("Không tìm thấy thông báo cần xoá.");
        return;
      }

      await acceptAddFriend(
        {
          sender: senderId,
          receiver: receiverId,
        },
        token
      );

      await createNotification(
        {
          senderId: receiverId,
          receiverId: senderId,
          type: "friend_accept",
        },
        token
      );

      await deleteNotification(notification._id, token);

      setNotifications?.((prevNotifications) =>
        prevNotifications.filter((notif) => notif._id !== notification._id)
      );
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "An error has occurred");
    }
  };
  return (
    <View className="flex flex-row space-x-2">
      <Button
        title="Accept"
        size="small"
        fontColor={colors.light[200]}
        onPress={() => handleAcceptFriend()}
      />
      <Button
        title="Decline"
        size="small"
        color={colorScheme === "dark" ? colors.dark[400] : colors.light[400]}
        // border="border border-border-100"
        fontColor="text-dark100_light100"
        onPress={() => handleRefuseFriend()}
      />
    </View>
  );
};

export default FriendRequestAction;
