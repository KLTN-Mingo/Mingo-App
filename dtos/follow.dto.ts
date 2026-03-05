import { PaginationDto, PaginationParams } from './common.dto';
import { UserMinimalDto } from './user.dto';

// ─── Enums ─────────────────────────────────────────────────────────────────────

export enum FollowStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum CloseFriendStatus {
  NONE = 'none',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum RelationshipType {
  NONE = 'none',
  FOLLOWER = 'follower',
  FOLLOWING = 'following',
  FRIEND = 'friend',
  CLOSE_FRIEND = 'close_friend',
}

// ─── Follow Request DTOs ───────────────────────────────────────────────────────

export interface SendFollowRequestDto {
  userId: string;
}

export interface RespondFollowRequestDto {
  accept: boolean;
}

// ─── Close Friend Request DTOs ─────────────────────────────────────────────────

export interface SendCloseFriendRequestDto {
  userId: string;
}

export interface RespondCloseFriendRequestDto {
  accept: boolean;
}

// ─── Query DTOs ────────────────────────────────────────────────────────────────

export interface GetFollowersQueryDto extends PaginationParams {
  status?: FollowStatus;
}

export interface GetFollowingQueryDto extends PaginationParams {
  status?: FollowStatus;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export interface FollowResponseDto {
  id: string;
  followerId: string;
  followingId: string;
  followStatus: FollowStatus;
  closeFriendStatus: CloseFriendStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FollowRequestDto {
  id: string;
  user: UserMinimalDto;
  status: FollowStatus;
  requestedAt: string;
  mutualFriendsCount?: number;
  mutualFriends?: UserMinimalDto[];
}

export interface CloseFriendRequestDto {
  id: string;
  user: UserMinimalDto;
  status: CloseFriendStatus;
  requestedAt: string;
}

export interface FollowerDto {
  id: string;
  follower: UserMinimalDto;
  followStatus: FollowStatus;
  closeFriendStatus: CloseFriendStatus;
  followedAt: string;
  isFollowingBack: boolean;
  relationshipType: RelationshipType;
}

export interface FollowingDto {
  id: string;
  following: UserMinimalDto;
  followStatus: FollowStatus;
  closeFriendStatus: CloseFriendStatus;
  followedAt: string;
  isFollower: boolean;
  relationshipType: RelationshipType;
}

export interface FriendDto {
  id: string;
  user: UserMinimalDto;
  isCloseFriend: boolean;
  closeFriendStatus: CloseFriendStatus;
  friendsSince: string;
}

export interface CloseFriendDto {
  id: string;
  user: UserMinimalDto;
  closeFriendSince: string;
}

// ─── Paginated Response DTOs ───────────────────────────────────────────────────

export interface PaginatedFollowersDto {
  followers: FollowerDto[];
  pagination: PaginationDto;
}

export interface PaginatedFollowingDto {
  following: FollowingDto[];
  pagination: PaginationDto;
}

export interface PaginatedFriendsDto {
  friends: FriendDto[];
  pagination: PaginationDto;
}

export interface PaginatedCloseFriendsDto {
  closeFriends: CloseFriendDto[];
  pagination: PaginationDto;
}

export interface PaginatedFollowRequestsDto {
  requests: FollowRequestDto[];
  pagination: PaginationDto;
}

export interface PaginatedCloseFriendRequestsDto {
  requests: CloseFriendRequestDto[];
  pagination: PaginationDto;
}

// ─── Stats & Status DTOs ───────────────────────────────────────────────────────

export interface FollowStatsDto {
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  closeFriendsCount: number;
  pendingFollowRequestsCount: number;
  pendingCloseFriendRequestsCount: number;
}

export interface RelationshipStatusDto {
  isFollowing: boolean;
  isFollower: boolean;
  followStatus?: FollowStatus;
  followerStatus?: FollowStatus;
  isFriend: boolean;
  isCloseFriend: boolean;
  closeFriendStatus: CloseFriendStatus;
  closeFriendRequestedBy?: string;
  relationshipType: RelationshipType;
}

// ─── Block DTOs ────────────────────────────────────────────────────────────────

export interface BlockUserRequestDto {
  userId: string;
  reason?: string;
}

export interface BlockResponseDto {
  id: string;
  blockerId: string;
  blockedId: string;
  reason?: string;
  createdAt: string;
}

export interface BlockedUserDto {
  id: string;
  user: UserMinimalDto;
  reason?: string;
  blockedAt: string;
}

export interface PaginatedBlockedUsersDto {
  blockedUsers: BlockedUserDto[];
  pagination: PaginationDto;
}

// ─── Helper Function ───────────────────────────────────────────────────────────

export function determineRelationshipType(
  isFollowing: boolean,
  isFollower: boolean,
  followStatus?: FollowStatus,
  followerStatus?: FollowStatus,
  closeFriendStatus?: CloseFriendStatus
): RelationshipType {
  if (closeFriendStatus === CloseFriendStatus.ACCEPTED) {
    return RelationshipType.CLOSE_FRIEND;
  }

  const isMutualFollow =
    isFollowing &&
    isFollower &&
    followStatus === FollowStatus.ACCEPTED &&
    followerStatus === FollowStatus.ACCEPTED;

  if (isMutualFollow) {
    return RelationshipType.FRIEND;
  }

  if (isFollowing && followStatus === FollowStatus.ACCEPTED) {
    return RelationshipType.FOLLOWING;
  }

  if (isFollower && followerStatus === FollowStatus.ACCEPTED) {
    return RelationshipType.FOLLOWER;
  }

  return RelationshipType.NONE;
}