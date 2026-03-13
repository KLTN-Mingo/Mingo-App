import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { View, Text, FlatList } from "react-native";
import { getMyBlocks } from "@/lib/service/user.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FriendResponseDTO } from "@/dtos/FriendDTO";
import FriendCard from "../../card/friend/FriendCard";

const Blocked = () => {
  const [blockeds, setBlockeds] = useState<FriendResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchBlocks = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      const data = await getMyBlocks(userId);
      setBlockeds(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching friend request:", error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error fetching posts. Please try again later.</Text>
      </View>
    );
  }

  return (
    <View className={`w-full h-5/6`}>
      <FlatList
        data={blockeds}
        keyExtractor={(item: any) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <FriendCard item={item} actionButton="block" setData={setBlockeds} />
        )}
      />
    </View>
  );
};

export default Blocked;
