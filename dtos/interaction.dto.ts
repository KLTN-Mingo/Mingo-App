// ─── Enums ─────────────────────────────────────────────────────────────────────

export type InteractionType =
  | "view"
  | "like"
  | "comment"
  | "share"
  | "save"
  | "follow_from_post"
  | "hide"
  | "not_interested"
  | "see_more"
  | "report";

export type InteractionSource =
  | "feed"
  | "explore"
  | "friends"
  | "profile"
  | "search"
  | "hashtag"
  | "notification";

export type InteractionDevice = "ios" | "android" | "web";

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export interface TrackInteractionRequestDto {
  postId: string;
  type: InteractionType;
  viewDuration?: number;
  scrollDepth?: number;
  source?: InteractionSource;
  deviceType?: InteractionDevice;
}
