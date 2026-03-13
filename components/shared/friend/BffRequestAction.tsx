import Button from "@/components/shared/ui/button";
import { NotificationResponseDTO } from "@/dtos/NotificationDTO";
import {
  acceptAddBff,
  unrequestBffOrRefuseBffRequest,
} from "@/lib/service/friend.service";
import {
  createNotification,
  deleteNotification,
  getNotification,
} from "@/lib/service/notification.service";
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
  const handleRefuseBff = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        alert("Bạn cần đăng nhập để thực hiện hành động này.");
        return;
      }

      // Tìm notification BFF request
      const notification = await getNotification(
        senderId,
        receiverId,
        "bff_request"
      );

      if (!notification || !notification._id) {
        console.warn("Không tìm thấy thông báo cần xoá.");
        return;
      }

      await unrequestBffOrRefuseBffRequest(
        {
          sender: senderId,
          receiver: receiverId,
        },
        token
      );

      await deleteNotification(notification._id, token);

      setNotifications?.((prev) =>
        prev.filter((notif) => notif._id !== notification._id)
      );
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Đã xảy ra lỗi.");
    }
  };

  const handleAcceptBff = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        alert("Bạn cần đăng nhập để thực hiện hành động này.");
        return;
      }

      // Tìm notification BFF request
      const notification = await getNotification(
        senderId,
        receiverId,
        "bff_request"
      );

      if (!notification || !notification._id) {
        console.warn("Không tìm thấy thông báo cần xoá.");
        return;
      }

      await acceptAddBff(
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
          type: "bff_accept",
        },
        token
      );

      await deleteNotification(notification._id, token);

      setNotifications?.((prev) =>
        prev.filter((notif) => notif._id !== notification._id)
      );
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Đã xảy ra lỗi.");
    }
  };
  return (
    <View className="flex flex-row space-x-2">
      <Button title="Accept" size="small" onPress={() => handleAcceptBff()} />
      <Button
        title="Decline"
        size="small"
        color="transparent"
        // border="border border-border-100"
        fontColor="text-dark100_light100"
        onPress={() => handleRefuseBff()}
      />
    </View>
  );
};

export default FriendRequestAction;
