import {
  FollowResponseDto,
  FollowStatus,
  FollowStatsDto,
  PaginatedCloseFriendsDto,
  PaginatedCloseFriendRequestsDto,
  PaginatedFollowersDto,
  PaginatedFollowingDto,
  PaginatedFollowRequestsDto,
  PaginatedFriendsDto,
  RelationshipStatusDto,
} from "@/dtos";
import { apiRequest } from "@/services/api-client";

const BASE_PATH = "/follow";

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(`${BASE_PATH}${endpoint}`, options);
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

  // Cancel sent follow request
  cancelRequest: (userId: string) =>
    fetchWithAuth<void>(`/requests/${userId}`, { method: "DELETE" }),

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

  getPendingCloseFriendRequests: (page = 1, limit = 20) =>
    fetchWithAuth<PaginatedCloseFriendRequestsDto>(
      `/close-friend/requests/pending?page=${page}&limit=${limit}`
    ),

  getRelationshipStatus: (userId: string) =>
    fetchWithAuth<RelationshipStatusDto>(`/users/${userId}/relationship`),

  respondCloseFriendRequest: (requestId: string, accept: boolean) =>
    fetchWithAuth<FollowResponseDto>(`/close-friend/requests/${requestId}/respond`, {
      method: "POST",
      body: JSON.stringify({ accept }),
    }),

  // Local helper to extract follow-only unread requests
  filterPendingFollowRequests: (requests: PaginatedFollowRequestsDto["requests"]) =>
    requests.filter((r) => r.status === FollowStatus.PENDING),
};
