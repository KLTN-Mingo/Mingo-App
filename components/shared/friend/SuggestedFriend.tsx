import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { getMyFollowers } from "@/lib/service/user.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, FlatList } from "react-native";
import { FriendResponseDTO } from "@/dtos/FriendDTO";
import FriendCard from "../../card/friend/FriendCard";
import { suggestFriends } from "@/lib/service/friend.service";

const SuggestedFriend = () => {
  const [suggesteds, setSuggesteds] = useState<FriendResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchSuggesteds = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log(token);
      const data = await suggestFriends(token);
      setSuggesteds(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching friend request:", error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggesteds();
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
        data={suggesteds}
        keyExtractor={(item: any) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <FriendCard
            item={item}
            actionButton="suggested"
            setData={setSuggesteds}
          />
        )}
      />
    </View>
  );
};

export default SuggestedFriend;
