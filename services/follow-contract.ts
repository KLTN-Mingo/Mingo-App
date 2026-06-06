import {
  CloseFriendStatus,
  determineRelationshipType,
  FollowStatus,
  RelationshipStatusDto,
} from "../dtos";

type FollowCollectionKind = "close-friends" | "followers" | "following";

type FollowCollectionOptions = {
  userId?: string;
  page?: number;
  limit?: number;
  status?: FollowStatus;
};

type FollowActionState = {
  action: "follow" | "cancel_request" | "unfollow";
  label: string;
};

function normalizeFollowStatus(value: unknown): FollowStatus | undefined {
  if (value === FollowStatus.PENDING) return FollowStatus.PENDING;
  if (value === FollowStatus.ACCEPTED) return FollowStatus.ACCEPTED;
  if (value === FollowStatus.REJECTED) return FollowStatus.REJECTED;
  return undefined;
}

function normalizeCloseFriendStatus(value: unknown): CloseFriendStatus {
  if (value === CloseFriendStatus.PENDING) return CloseFriendStatus.PENDING;
  if (value === CloseFriendStatus.ACCEPTED) return CloseFriendStatus.ACCEPTED;
  if (value === CloseFriendStatus.REJECTED) return CloseFriendStatus.REJECTED;
  return CloseFriendStatus.NONE;
}

export function normalizeRelationshipStatus(raw: unknown): RelationshipStatusDto {
  if (!raw || typeof raw !== "object") {
    return {
      isFollowing: false,
      isFollower: false,
      isFriend: false,
      isCloseFriend: false,
      closeFriendStatus: CloseFriendStatus.NONE,
      relationshipType: determineRelationshipType(false, false),
    };
  }

  const value = raw as Record<string, unknown>;
  const followStatus = normalizeFollowStatus(value.followStatus);
  const followerStatus = normalizeFollowStatus(value.followerStatus);
  const closeFriendStatus = normalizeCloseFriendStatus(value.closeFriendStatus);

  const rawIsFollowing = value.isFollowing === true;
  const rawIsFollower = value.isFollower === true;
  const rawIsCloseFriend =
    value.isCloseFriend === true ||
    value.relationshipType === "close_friend" ||
    value.relationship === "close_friend";

  const isFollowing =
    followStatus === FollowStatus.ACCEPTED ||
    (followStatus === undefined && rawIsFollowing);
  const isFollower =
    followerStatus === FollowStatus.ACCEPTED ||
    (followerStatus === undefined && rawIsFollower);
  const isFriend = isFollowing && isFollower;
  const isCloseFriend =
    isFriend &&
    closeFriendStatus === CloseFriendStatus.ACCEPTED &&
    rawIsCloseFriend;

  return {
    isFollowing,
    isFollower,
    followStatus,
    followerStatus,
    isFriend,
    isCloseFriend,
    closeFriendStatus,
    closeFriendRequestedBy:
      typeof value.closeFriendRequestedBy === "string"
        ? value.closeFriendRequestedBy
        : undefined,
    relationshipType: determineRelationshipType(
      isFollowing,
      isFollower,
      followStatus,
      followerStatus,
      isCloseFriend ? CloseFriendStatus.ACCEPTED : closeFriendStatus
    ),
  };
}

export function getFollowActionState(
  relationship: RelationshipStatusDto | null | undefined
): FollowActionState {
  const status = relationship?.followStatus;

  if (status === FollowStatus.PENDING) {
    return { action: "cancel_request", label: "Đã gửi yêu cầu" };
  }

  if (status === FollowStatus.ACCEPTED) {
    return { action: "unfollow", label: "Đang theo dõi" };
  }

  return { action: "follow", label: "Theo dõi" };
}

export function buildFollowCollectionPath(
  kind: FollowCollectionKind,
  options: FollowCollectionOptions = {}
): string {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (kind === "close-friends") {
    return `/close-friends?${params.toString()}`;
  }

  if (!options.userId) {
    throw new Error(`userId is required for ${kind}`);
  }

  if (
    options.status === FollowStatus.ACCEPTED ||
    options.status === FollowStatus.PENDING ||
    options.status === FollowStatus.REJECTED
  ) {
    params.set("status", options.status);
  }

  return `/${encodeURIComponent(options.userId)}/${kind}?${params.toString()}`;
}
