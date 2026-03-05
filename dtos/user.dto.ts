// ─── Enums ─────────────────────────────────────────────────────────────────────

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
  }
  
  export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    MODERATOR = 'moderator',
  }
  
  // ─── Request DTOs ──────────────────────────────────────────────────────────────
  
  export interface UpdateProfileRequestDto {
    name?: string;
    bio?: string;
    avatar?: string;
    backgroundUrl?: string;
    dateOfBirth?: string;
    gender?: Gender;
  }
  
  export interface GetUsersQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    isBlocked?: boolean;
  }
  
  // ─── Response DTOs ─────────────────────────────────────────────────────────────
  
  /** Minimal info - dùng để nhúng trong các entity khác */
  export interface UserMinimalDto {
    id: string;
    name?: string;
    avatar?: string;
    verified: boolean;
  }
  
  /** Public profile - dùng khi xem profile người khác */
  export interface PublicUserDto {
    id: string;
    name?: string;
    bio?: string;
    avatar?: string;
    backgroundUrl?: string;
    gender?: Gender;
    verified: boolean;
    onlineStatus: boolean;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    createdAt: string;
  }
  
  /** Profile đầy đủ - dùng cho /me */
  export interface UserProfileDto {
    id: string;
    phoneNumber: string;
    email?: string;
    name?: string;
    bio?: string;
    avatar?: string;
    backgroundUrl?: string;
    dateOfBirth?: string;
    gender?: Gender;
    role: UserRole;
    verified: boolean;
    twoFactorEnabled: boolean;
    isActive: boolean;
    isBlocked: boolean;
    onlineStatus: boolean;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  /** Summary - dùng trong danh sách (admin) */
  export interface UserSummaryDto {
    id: string;
    phoneNumber: string;
    email?: string;
    name?: string;
    avatar?: string;
    role: UserRole;
    verified: boolean;
    isActive: boolean;
    isBlocked: boolean;
    onlineStatus: boolean;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    lastLogin?: string;
    createdAt: string;
  }