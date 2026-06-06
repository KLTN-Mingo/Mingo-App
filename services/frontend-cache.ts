type CacheListener = () => void | Promise<void>;

const valueStore = new Map<string, unknown>();
const listeners = new Map<string, Set<CacheListener>>();

export const frontendCacheKeys = {
  relationship: (targetUserId: string) => `relationship:${targetUserId}`,
  followStats: (userId: string) => `follow-stats:${userId}`,
  followers: (userId: string) => `followers:${userId}`,
  following: (userId: string) => `following:${userId}`,
  friends: (userId: string) => `friends:${userId}`,
  closeFriends: "close-friends",
  pendingFollowRequests: "pending-follow-requests",
  sentFollowRequests: "sent-follow-requests",
  pendingCloseFriendRequests: "pending-close-friend-requests",
  blockedUsers: "blocked-users",
  postDetail: (postId: string) => `post-detail:${postId}`,
  savedPosts: "saved-posts",
  feedPosts: "feed-posts",
  userPosts: (userId: string) => `user-posts:${userId}`,
} as const;

export function getCachedValue<T>(key: string): T | undefined {
  return valueStore.get(key) as T | undefined;
}

export function setCachedValue<T>(key: string, value: T): T {
  valueStore.set(key, value);
  return value;
}

export function clearCachedValue(key: string): void {
  valueStore.delete(key);
}

export function invalidateCacheKeys(keys: string[]): void {
  const uniqueKeys = [...new Set(keys)];

  for (const key of uniqueKeys) {
    valueStore.delete(key);
    const currentListeners = listeners.get(key);
    if (!currentListeners) continue;

    for (const listener of currentListeners) {
      void listener();
    }
  }
}

export function subscribeCacheInvalidation(
  key: string,
  listener: CacheListener
): () => void {
  const currentListeners = listeners.get(key) ?? new Set<CacheListener>();
  currentListeners.add(listener);
  listeners.set(key, currentListeners);

  return () => {
    const activeListeners = listeners.get(key);
    if (!activeListeners) return;
    activeListeners.delete(listener);
    if (activeListeners.size === 0) {
      listeners.delete(key);
    }
  };
}
