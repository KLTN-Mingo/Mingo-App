import {
  CloseFriendStatus,
  FollowStatsDto,
  FollowStatus,
  PaginatedBlockedUsersDto,
  PaginatedCloseFriendsDto,
  PaginatedCloseFriendRequestsDto,
  PaginatedFollowersDto,
  PaginatedFollowingDto,
  PaginatedFollowRequestsDto,
  PaginatedFriendsDto,
  RelationshipStatusDto,
  RelationshipType,
} from "@/dtos";
import { PaginationDto } from "@/dtos/common.dto";
import { UserMinimalDto } from "@/dtos/user.dto";
import { apiRequest } from "@/services/api-client";

/** Base path theo Mingo BE guide: `/api/follows` */
const BASE = "/follows";

async function fetchFollow<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(`${BASE}${path}`, options);
}

function pickPagination(raw: Record<string, unknown> | null | undefined): PaginationDto {
  const p = (raw?.pagination as Record<string, unknown>) ?? {};
  return {
    page: Number(p.page ?? 1),
    limit: Number(p.limit ?? 10),
    total: Number(p.total ?? 0),
    totalPages: Number(p.totalPages ?? 0),
    hasMore: Boolean(p.hasMore ?? false),
  };
}

function pickArray(raw: unknown, keys: string[]): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    for (const k of keys) {
      const v = o[k];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

function asUserMinimal(u: any): UserMinimalDto {
  const id = u?.id ?? u?._id?.toString?.() ?? "";
  return {
    id,
    name: u?.name,
    avatar: u?.avatar,
    verified: Boolean(u?.verified),
  };
}

/** Map `{ relationship: "following" | ... }` (Mingo) → RelationshipStatusDto */
export function mapMingoRelationship(raw: unknown): RelationshipStatusDto {
  if (!raw || typeof raw !== "object") {
    return {
      isFollowing: false,
      isFollower: false,
      isFriend: false,
      isCloseFriend: false,
      closeFriendStatus: CloseFriendStatus.NONE,
      relationshipType: RelationshipType.NONE,
    };
  }
  const o = raw as Record<string, unknown>;
  if (typeof o.isFollowing === "boolean" && o.relationshipType) {
    return raw as RelationshipStatusDto;
  }
  const r = String(o.relationship ?? "").toLowerCase();
  const isCloseFriend = r === "close_friend";
  const isFriend = r === "friend" || isCloseFriend;
  const isFollowing = r === "following" || isFriend;
  const isFollower = r === "follower" || isFriend;
  let relationshipType = RelationshipType.NONE;
  if (isCloseFriend) relationshipType = RelationshipType.CLOSE_FRIEND;
  else if (r === "friend") relationshipType = RelationshipType.FRIEND;
  else if (r === "following") relationshipType = RelationshipType.FOLLOWING;
  else if (r === "follower") relationshipType = RelationshipType.FOLLOWER;

  return {
    isFollowing,
    isFollower,
    followStatus: isFollowing ? FollowStatus.ACCEPTED : undefined,
    followerStatus: isFollower ? FollowStatus.ACCEPTED : undefined,
    isFriend,
    isCloseFriend,
    closeFriendStatus: isCloseFriend
      ? CloseFriendStatus.ACCEPTED
      : CloseFriendStatus.NONE,
    relationshipType,
  };
}

function mapMingoStats(raw: unknown): FollowStatsDto {
  if (!raw || typeof raw !== "object") {
    return {
      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
      closeFriendsCount: 0,
      pendingFollowRequestsCount: 0,
      pendingCloseFriendRequestsCount: 0,
    };
  }
  const o = raw as Record<string, unknown>;
  if (typeof o.followersCount === "number") {
    return o as FollowStatsDto;
  }
  return {
    followersCount: Number(o.followers ?? o.followersCount ?? 0),
    followingCount: Number(o.following ?? o.followingCount ?? 0),
    friendsCount: Number(o.friends ?? o.friendsCount ?? 0),
    closeFriendsCount: Number(o.closeFriends ?? o.closeFriendsCount ?? 0),
    pendingFollowRequestsCount: Number(
      o.pendingFollowRequestsCount ?? o.pendingRequests ?? 0
    ),
    pendingCloseFriendRequestsCount: Number(
      o.pendingCloseFriendRequestsCount ?? o.pendingCloseRequests ?? 0
    ),
  };
}

function normalizeFollowRequests(raw: unknown): PaginatedFollowRequestsDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  let requests = pickArray(o, ["requests", "data", "items"]) as any[];
  if (requests.length && !requests[0]?.user && requests[0]?.follower) {
    requests = requests.map((row: any) => ({
      id: row.id ?? row._id,
      user: asUserMinimal(row.follower ?? row.user),
      status: row.followStatus ?? row.status ?? FollowStatus.PENDING,
      requestedAt: row.createdAt ?? row.requestedAt ?? new Date().toISOString(),
    }));
  } else if (requests.length && !requests[0]?.user) {
    requests = requests.map((row: any) => ({
      id: row.id ?? row._id,
      user: asUserMinimal(row),
      status: row.followStatus ?? row.status ?? FollowStatus.PENDING,
      requestedAt: row.createdAt ?? row.requestedAt ?? new Date().toISOString(),
    }));
  }
  return {
    requests,
    pagination: pickPagination(o),
  };
}

function normalizeCloseFriendRequests(raw: unknown): PaginatedCloseFriendRequestsDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  let requests = pickArray(o, ["requests", "data", "items"]) as any[];
  if (requests.length && !requests[0]?.user) {
    requests = requests.map((row: any) => ({
      id: row.id ?? row._id,
      user: asUserMinimal(row.user ?? row),
      status: row.closeFriendStatus ?? row.status ?? CloseFriendStatus.PENDING,
      requestedAt: row.createdAt ?? row.requestedAt ?? new Date().toISOString(),
    }));
  }
  return {
    requests,
    pagination: pickPagination(o),
  };
}

function normalizeFriends(raw: unknown): PaginatedFriendsDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  let friends = pickArray(o, ["friends", "data", "items"]) as any[];
  if (friends.length && !friends[0]?.user) {
    friends = friends.map((row: any) => ({
      id: row.id ?? `${row.userId ?? row.id}`,
      user: asUserMinimal(row),
      isCloseFriend: Boolean(row.isCloseFriend),
      closeFriendStatus: row.closeFriendStatus ?? CloseFriendStatus.NONE,
      friendsSince: row.friendsSince ?? row.createdAt ?? new Date().toISOString(),
    }));
  }
  return { friends, pagination: pickPagination(o) };
}

function normalizeCloseFriends(raw: unknown): PaginatedCloseFriendsDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  let closeFriends = pickArray(o, ["closeFriends", "data", "items"]) as any[];
  if (closeFriends.length && !closeFriends[0]?.user) {
    closeFriends = closeFriends.map((row: any) => ({
      id: row.id ?? `${row.userId ?? row.id}`,
      user: asUserMinimal(row),
      closeFriendSince: row.closeFriendSince ?? row.createdAt ?? new Date().toISOString(),
    }));
  }
  return { closeFriends, pagination: pickPagination(o) };
}

function normalizeFollowers(raw: unknown): PaginatedFollowersDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  let followers = pickArray(o, ["followers", "data", "items"]) as any[];
  if (followers.length && !followers[0]?.follower) {
    followers = followers.map((row: any) => ({
      id: row.id ?? `${row.followerId ?? row.id}`,
      follower: asUserMinimal(row.follower ?? row),
      followStatus: row.followStatus ?? FollowStatus.ACCEPTED,
      closeFriendStatus: row.closeFriendStatus ?? CloseFriendStatus.NONE,
      followedAt: row.followedAt ?? row.createdAt ?? new Date().toISOString(),
      isFollowingBack: Boolean(row.isFollowingBack),
      relationshipType: row.relationshipType ?? RelationshipType.FOLLOWER,
    }));
  }
  return { followers, pagination: pickPagination(o) };
}

function normalizeFollowing(raw: unknown): PaginatedFollowingDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  let following = pickArray(o, ["following", "data", "items"]) as any[];
  if (following.length && !following[0]?.following) {
    following = following.map((row: any) => ({
      id: row.id ?? `${row.followingId ?? row.id}`,
      following: asUserMinimal(row.following ?? row),
      followStatus: row.followStatus ?? FollowStatus.ACCEPTED,
      closeFriendStatus: row.closeFriendStatus ?? CloseFriendStatus.NONE,
      followedAt: row.followedAt ?? row.createdAt ?? new Date().toISOString(),
      isFollower: Boolean(row.isFollower),
      relationshipType: row.relationshipType ?? RelationshipType.FOLLOWING,
    }));
  }
  return { following, pagination: pickPagination(o) };
}

export const FollowApi = {
  getPendingRequests: async (page = 1, limit = 20) => {
    const raw = await fetchFollow<unknown>(
      `/requests/pending?page=${page}&limit=${limit}`
    );
    return normalizeFollowRequests(raw);
  },

  getSentRequests: async (page = 1, limit = 20) => {
    const raw = await fetchFollow<unknown>(
      `/requests/sent?page=${page}&limit=${limit}`
    );
    return normalizeFollowRequests(raw);
  },

  respondToRequest: (requestId: string, accept: boolean) =>
    fetchFollow(`/request/${requestId}/respond`, {
      method: "PUT",
      body: JSON.stringify({ accept }),
    }),

  cancelRequest: (userId: string) =>
    fetchFollow<void>(`/request/${userId}`, { method: "DELETE" }),

  getFriends: async (userId: string, page = 1, limit = 20) => {
    const raw = await fetchFollow<unknown>(
      `/friends/${encodeURIComponent(userId)}?page=${page}&limit=${limit}`
    );
    return normalizeFriends(raw);
  },

  /** Danh sách bạn thân của user đăng nhập — guide: GET /follows/close-friends */
  getCloseFriends: async (_userId?: string, page = 1, limit = 20) => {
    const raw = await fetchFollow<unknown>(
      `/close-friends?page=${page}&limit=${limit}`
    );
    return normalizeCloseFriends(raw);
  },

  getFollowers: async (userId: string, page = 1, limit = 20) => {
    const raw = await fetchFollow<unknown>(
      `/followers/${encodeURIComponent(userId)}?page=${page}&limit=${limit}`
    );
    return normalizeFollowers(raw);
  },

  getFollowing: async (userId: string, page = 1, limit = 20) => {
    const raw = await fetchFollow<unknown>(
      `/following/${encodeURIComponent(userId)}?page=${page}&limit=${limit}`
    );
    return normalizeFollowing(raw);
  },

  getStats: async (userId: string) => {
    const raw = await fetchFollow<unknown>(
      `/stats/${encodeURIComponent(userId)}`
    );
    return mapMingoStats(raw);
  },

  sendFollowRequest: (userId: string) =>
    fetchFollow("/request", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  unfollow: (userId: string) =>
    fetchFollow<void>(`/${encodeURIComponent(userId)}`, { method: "DELETE" }),

  sendCloseFriendRequest: (userId: string) =>
    fetchFollow("/close-friend/request", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  removeCloseFriend: (userId: string) =>
    fetchFollow<void>(`/close-friend/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    }),

  getPendingCloseFriendRequests: async (page = 1, limit = 20) => {
    const raw = await fetchFollow<unknown>(
      `/close-friend/requests/pending?page=${page}&limit=${limit}`
    );
    return normalizeCloseFriendRequests(raw);
  },

  getRelationshipStatus: async (userId: string) => {
    const raw = await fetchFollow<unknown>(
      `/relationship/${encodeURIComponent(userId)}`
    );
    return mapMingoRelationship(raw);
  },

  respondCloseFriendRequest: (requestId: string, accept: boolean) =>
    fetchFollow(`/close-friend/request/${encodeURIComponent(requestId)}/respond`, {
      method: "PUT",
      body: JSON.stringify({ accept }),
    }),

  blockUser: (userId: string) =>
    fetchFollow("/blocks", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  unblockUser: (userId: string) =>
    fetchFollow<void>(`/blocks/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    }),

  getBlockedUsers: async (page = 1, limit = 20) => {
    const raw = await fetchFollow<unknown>(`/blocks?page=${page}&limit=${limit}`);
    const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    let blockedUsers = pickArray(o, ["blockedUsers", "data", "items"]) as any[];
    if (blockedUsers.length && !blockedUsers[0]?.user) {
      blockedUsers = blockedUsers.map((row: any) => ({
        id: row.id ?? row._id,
        user: asUserMinimal(row),
        blockedAt: row.blockedAt ?? row.createdAt ?? new Date().toISOString(),
      }));
    }
    return {
      blockedUsers,
      pagination: pickPagination(o),
    } as PaginatedBlockedUsersDto;
  },

  filterPendingFollowRequests: (requests: PaginatedFollowRequestsDto["requests"]) =>
    requests.filter((r) => r.status === FollowStatus.PENDING),
};
