import AsyncStorage from "@react-native-async-storage/async-storage";
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
  SendFollowRequestDto,
} from "@/dtos";
import { PaginationDto } from "@/dtos/common.dto";
import { UserMinimalDto } from "@/dtos/user.dto";
import { apiRequest } from "@/services/api-client";
import {
  buildFollowCollectionPath,
  normalizeRelationshipStatus,
} from "@/services/follow-contract";
import {
  clearCachedValue,
  frontendCacheKeys,
  getCachedValue,
  invalidateCacheKeys,
  setCachedValue,
} from "@/services/frontend-cache";

/** Base path khớp BE: `GET /api/follow/...` (vd. `/requests/pending`) */
const BASE = "/follow";

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
  return normalizeRelationshipStatus(raw);
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
    return o as unknown as FollowStatsDto;
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
  const following = pickArray(o, ["following", "data", "items"])
    .map((row: any) => {
      const userSource =
        row?.following ??
        row?.user ??
        (row?.followingId && typeof row.followingId === "object"
          ? row.followingId
          : row);
      const user = asUserMinimal(userSource);
      if (!user.id) return null;

      return {
        id: row?.id ?? row?._id ?? `${user.id}`,
        following: user,
        followStatus: row?.followStatus ?? row?.status ?? FollowStatus.ACCEPTED,
        closeFriendStatus:
          row?.closeFriendStatus ?? CloseFriendStatus.NONE,
        followedAt:
          row?.followedAt ?? row?.createdAt ?? new Date().toISOString(),
        isFollower: Boolean(row?.isFollower),
        relationshipType:
          row?.relationshipType ?? RelationshipType.FOLLOWING,
      };
    })
    .filter(Boolean) as PaginatedFollowingDto["following"];
  return { following, pagination: pickPagination(o) };
}

export const FollowApi = {
  getPendingRequests: async (page = 1, limit = 20) => {
    const cacheKey = frontendCacheKeys.pendingFollowRequests;
    const cached = getCachedValue<PaginatedFollowRequestsDto>(cacheKey);
    if (cached) return cached;
    const raw = await fetchFollow<unknown>(
      `/requests/pending?page=${page}&limit=${limit}`
    );
    return setCachedValue(cacheKey, normalizeFollowRequests(raw));
  },

  getSentRequests: async (page = 1, limit = 20) => {
    const cacheKey = frontendCacheKeys.sentFollowRequests;
    const cached = getCachedValue<PaginatedFollowRequestsDto>(cacheKey);
    if (cached) return cached;
    const raw = await fetchFollow<unknown>(
      `/requests/sent?page=${page}&limit=${limit}`
    );
    return setCachedValue(cacheKey, normalizeFollowRequests(raw));
  },

  respondToRequest: async (requestId: string, accept: boolean) => {
    const result = await fetchFollow(`/request/${requestId}/respond`, {
      method: "PUT",
      body: JSON.stringify({ accept }),
    });
    await invalidateRelationshipMutationCaches();
    return result;
  },

  cancelRequest: async (userId: string) => {
    const result = await fetchFollow<void>(`/request/${userId}`, { method: "DELETE" });
    await invalidateRelationshipMutationCaches(userId);
    return result;
  },

  getFriends: async (userId: string, page = 1, limit = 20) => {
    const cacheKey = frontendCacheKeys.friends(userId);
    const cached = getCachedValue<PaginatedFriendsDto>(cacheKey);
    if (cached) return cached;
    const raw = await fetchFollow<unknown>(
      `/${encodeURIComponent(userId)}/friends?page=${page}&limit=${limit}`
    );
    return setCachedValue(cacheKey, normalizeFriends(raw));
  },

  /** Danh sách bạn thân — GET /api/follow/close-friends (hoặc /:userId/close-friends) */
  getCloseFriends: async (_userId?: string, page = 1, limit = 20) => {
    const cacheKey = frontendCacheKeys.closeFriends;
    const cached = getCachedValue<PaginatedCloseFriendsDto>(cacheKey);
    if (cached) return cached;
    const raw = await fetchFollow<unknown>(
      buildFollowCollectionPath("close-friends", { page, limit })
    );
    return setCachedValue(cacheKey, normalizeCloseFriends(raw));
  },

  getFollowers: async (
    userId: string,
    page = 1,
    limit = 20,
    status?: FollowStatus
  ) => {
    const cacheKey = frontendCacheKeys.followers(userId);
    const cached = getCachedValue<PaginatedFollowersDto>(cacheKey);
    if (cached && status === undefined) return cached;
    const raw = await fetchFollow<unknown>(
      buildFollowCollectionPath("followers", { userId, page, limit, status })
    );
    const normalized = normalizeFollowers(raw);
    if (status === undefined) {
      setCachedValue(cacheKey, normalized);
    }
    return normalized;
  },

  getFollowing: async (
    userId: string,
    page = 1,
    limit = 20,
    status?: FollowStatus
  ) => {
    const cacheKey = frontendCacheKeys.following(userId);
    const cached = getCachedValue<PaginatedFollowingDto>(cacheKey);
    if (cached && status === undefined) return normalizeFollowing(cached);
    const raw = await fetchFollow<unknown>(
      buildFollowCollectionPath("following", { userId, page, limit, status })
    );
    const normalized = normalizeFollowing(raw);
    if (status === undefined) {
      setCachedValue(cacheKey, normalized);
    }
    return normalized;
  },

  getStats: async (userId?: string) => {
    const cacheKey = frontendCacheKeys.followStats(userId ?? "me");
    const cached = getCachedValue<FollowStatsDto>(cacheKey);
    if (cached) return cached;
    const raw = await fetchFollow<unknown>(
      userId ? `/stats/${encodeURIComponent(userId)}` : `/stats`
    );
    return setCachedValue(cacheKey, mapMingoStats(raw));
  },

  sendFollowRequest: async (
    userId: string,
    context?: Omit<SendFollowRequestDto, "userId">
  ) => {
    const result = await fetchFollow("/request", {
      method: "POST",
      body: JSON.stringify({
        userId,
        ...(context ?? {}),
      }),
    });
    await invalidateRelationshipMutationCaches(userId);
    return result;
  },

  unfollow: async (userId: string) => {
    const result = await fetchFollow<void>(`/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    await invalidateRelationshipMutationCaches(userId);
    return result;
  },

  /** Xóa follower — user X từng follow mình, mình muốn họ unfollow mình. */
  removeFollower: async (userId: string) => {
    const result = await fetchFollow<void>(`/follower/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    await invalidateRelationshipMutationCaches(userId);
    return result;
  },

  sendCloseFriendRequest: async (userId: string) => {
    const result = await fetchFollow("/close-friend/request", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    await invalidateRelationshipMutationCaches(userId);
    return result;
  },

  removeCloseFriend: async (userId: string) => {
    const result = await fetchFollow<void>(`/close-friend/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    await invalidateRelationshipMutationCaches(userId);
    return result;
  },

  getPendingCloseFriendRequests: async (page = 1, limit = 20) => {
    const cacheKey = frontendCacheKeys.pendingCloseFriendRequests;
    const cached = getCachedValue<PaginatedCloseFriendRequestsDto>(cacheKey);
    if (cached) return cached;
    const raw = await fetchFollow<unknown>(
      `/close-friend/requests/pending?page=${page}&limit=${limit}`
    );
    return setCachedValue(cacheKey, normalizeCloseFriendRequests(raw));
  },

  getRelationshipStatus: async (userId: string) => {
    const cacheKey = frontendCacheKeys.relationship(userId);
    const cached = getCachedValue<RelationshipStatusDto>(cacheKey);
    if (cached) return cached;
    const raw = await fetchFollow<unknown>(
      `/relationship/${encodeURIComponent(userId)}`
    );
    return setCachedValue(cacheKey, mapMingoRelationship(raw));
  },

  respondCloseFriendRequest: async (requestId: string, accept: boolean) => {
    const result = await fetchFollow(`/close-friend/request/${encodeURIComponent(requestId)}/respond`, {
      method: "PUT",
      body: JSON.stringify({ accept }),
    });
    await invalidateRelationshipMutationCaches();
    return result;
  },

  blockUser: async (userId: string, reason?: string) => {
    const result = await fetchFollow("/blocks", {
      method: "POST",
      body: JSON.stringify(
        reason ? { userId, reason } : { userId }
      ),
    });
    await invalidateRelationshipMutationCaches(userId, { blocked: true });
    return result;
  },

  unblockUser: async (userId: string) => {
    const result = await fetchFollow<void>(`/blocks/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    await invalidateRelationshipMutationCaches(userId);
    return result;
  },

  getBlockedUsers: async (page = 1, limit = 20) => {
    const cacheKey = frontendCacheKeys.blockedUsers;
    const cached = getCachedValue<PaginatedBlockedUsersDto>(cacheKey);
    if (cached) return cached;
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
    return setCachedValue(cacheKey, {
      blockedUsers,
      pagination: pickPagination(o),
    } as PaginatedBlockedUsersDto);
  },

  filterPendingFollowRequests: (requests: PaginatedFollowRequestsDto["requests"]) =>
    requests.filter((r) => r.status === FollowStatus.PENDING),
};

async function getStoredCurrentUserId(): Promise<string | undefined> {
  try {
    const raw = await AsyncStorage.getItem("user");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { id?: string } | null;
    return parsed?.id;
  } catch {
    return undefined;
  }
}

async function invalidateRelationshipMutationCaches(
  targetUserId?: string,
  options: { blocked?: boolean } = {}
): Promise<void> {
  const currentUserId = await getStoredCurrentUserId();
  const keys: string[] = [
    frontendCacheKeys.pendingFollowRequests,
    frontendCacheKeys.sentFollowRequests,
    frontendCacheKeys.pendingCloseFriendRequests,
    frontendCacheKeys.closeFriends,
    frontendCacheKeys.blockedUsers,
  ];

  if (currentUserId) {
    keys.push(
      frontendCacheKeys.followStats("me"),
      frontendCacheKeys.followStats(currentUserId),
      frontendCacheKeys.followers(currentUserId),
      frontendCacheKeys.following(currentUserId),
      frontendCacheKeys.friends(currentUserId),
      frontendCacheKeys.userPosts(currentUserId)
    );
  }

  if (targetUserId) {
    keys.push(
      frontendCacheKeys.relationship(targetUserId),
      frontendCacheKeys.followStats(targetUserId),
      frontendCacheKeys.followers(targetUserId),
      frontendCacheKeys.following(targetUserId),
      frontendCacheKeys.friends(targetUserId),
      frontendCacheKeys.userPosts(targetUserId)
    );
  }

  invalidateCacheKeys(keys);

  if (options.blocked && targetUserId) {
    clearCachedValue(frontendCacheKeys.relationship(targetUserId));
  }
}
