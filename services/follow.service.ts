import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ApiResponse,
  FollowResponseDto,
  FollowStatsDto,
  PaginatedCloseFriendsDto,
  PaginatedFollowersDto,
  PaginatedFollowingDto,
  PaginatedFollowRequestsDto,
  PaginatedFriendsDto,
} from "@/dtos";
import { authService } from "@/services/auth.service";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

const BASE_URL = `${API_URL}/follow`;

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await AsyncStorage.getItem("accessToken");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok) {
    await authService.handleUnauthorizedResponse(response, json.message);
    throw new Error(json.message || "Something went wrong");
  }

  return json.data;
}

export const FollowApi = {
  // Get pending follow requests (received)
  getPendingRequests: (page = 1, limit = 20) =>
    fetchWithAuth<PaginatedFollowRequestsDto>(
      `/requests/pending?page=${page}&limit=${limit}`
    ),

  // Get sent follow requests
  getSentRequests: (page = 1, limit = 20) =>
    fetchWithAuth<PaginatedFollowRequestsDto>(
      `/requests/sent?page=${page}&limit=${limit}`
    ),

  // Respond to follow request
  respondToRequest: (requestId: string, accept: boolean) =>
    fetchWithAuth<FollowResponseDto>(`/requests/${requestId}/respond`, {
      method: "POST",
      body: JSON.stringify({ accept }),
    }),

  // Get friends list
  getFriends: (userId: string, page = 1, limit = 20) =>
    fetchWithAuth<PaginatedFriendsDto>(
      `/users/${userId}/friends?page=${page}&limit=${limit}`
    ),

  // Get close friends list
  getCloseFriends: (userId: string, page = 1, limit = 20) =>
    fetchWithAuth<PaginatedCloseFriendsDto>(
      `/users/${userId}/close-friends?page=${page}&limit=${limit}`
    ),

  // Get followers
  getFollowers: (userId: string, page = 1, limit = 20) =>
    fetchWithAuth<PaginatedFollowersDto>(
      `/users/${userId}/followers?page=${page}&limit=${limit}`
    ),

  // Get following
  getFollowing: (userId: string, page = 1, limit = 20) =>
    fetchWithAuth<PaginatedFollowingDto>(
      `/users/${userId}/following?page=${page}&limit=${limit}`
    ),

  // Get follow stats
  getStats: (userId: string) =>
    fetchWithAuth<FollowStatsDto>(`/users/${userId}/stats`),

  // Send follow request
  sendFollowRequest: (userId: string) =>
    fetchWithAuth<FollowResponseDto>("/request", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  // Unfollow
  unfollow: (userId: string) =>
    fetchWithAuth<void>(`/unfollow/${userId}`, { method: "DELETE" }),

  // Send close friend request
  sendCloseFriendRequest: (userId: string) =>
    fetchWithAuth<FollowResponseDto>("/close-friend/request", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  // Remove close friend
  removeCloseFriend: (userId: string) =>
    fetchWithAuth<void>(`/close-friend/${userId}`, { method: "DELETE" }),
};
