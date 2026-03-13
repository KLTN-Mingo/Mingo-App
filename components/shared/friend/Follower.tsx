import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { getMyFollowers } from "@/lib/service/user.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, FlatList } from "react-native";
import { FriendResponseDTO } from "@/dtos/FriendDTO";
import FriendCard from "../../card/friend/FriendCard";

const Follower = () => {
  const [followers, setFollowers] = useState<FriendResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchFollowers = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const data = await getMyFollowers(userId);
      setFollowers(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching friend request:", error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
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
        data={followers}
        keyExtractor={(item: any) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <FriendCard
            item={item}
            actionButton="follower"
            setData={setFollowers}
          />
        )}
      />
    </View>
  );
};

export default Follower;
