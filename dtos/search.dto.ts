/**
 * Search DTOs — khớp với BE: GET /search?q=&page=&limit=&type=
 * Response shape: { query, users, posts, pagination }
 */

export type GlobalSearchType = "all" | "users" | "posts";

export interface SearchUserItemDto {
  id: string;
  name?: string;
  avatar?: string;
  bio?: string;
  verified: boolean;
  followersCount: number;
  postsCount: number;
}

export interface SearchPostUserDto {
  id: string;
  name?: string;
  avatar?: string;
  verified: boolean;
}

export interface SearchPostItemDto {
  id: string;
  contentText?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  user: SearchPostUserDto | null;
}

export interface GlobalSearchPaginationDto {
  page: number;
  limit: number;
  usersTotal: number;
  postsTotal: number;
}

export interface GlobalSearchResultDto {
  query: string;
  users: SearchUserItemDto[];
  posts: SearchPostItemDto[];
  pagination: GlobalSearchPaginationDto;
}

export interface GlobalSearchParams {
  q: string;
  page?: number;
  /** BE giới hạn 1..20 */
  limit?: number;
  type?: GlobalSearchType;
}
