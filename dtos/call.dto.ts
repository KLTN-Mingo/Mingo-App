// Call / WebRTC socket DTOs – aligned with (modals) base implementation

import { PaginationDto, PaginationParams } from "./common.dto";
import { UserMinimalDto } from "./user.dto";

export interface CallProfile {
  id: string;
  name?: string;
  avatar?: string;
}

export interface SocketUser {
  userId: string;
  socketId: string;
  profile: CallProfile;
}

export interface Participants {
  caller: SocketUser;
  receiver: SocketUser;
}

export type CallStatus = "outgoing" | "ringing" | "connected";

export interface OngoingCall {
  participants: Participants;
  isRinging: boolean;
  isVideoCall: boolean;
  boxId?: string;
  /** outgoing = người gọi đang chờ; ringing = người nhận đang nghe; connected = đã chấp nhận */
  callStatus?: CallStatus;
}

// ─── REST API ─────────────────────────────────────────────────────────────────

export type CallHistoryStatus =
  | "ringing"
  | "accepted"
  | "declined"
  | "ended"
  | "missed";

export type CallKind = "audio" | "video";

export interface CallHistoryDto {
  id: string;
  callerId: string;
  receiverId: string;
  caller?: UserMinimalDto;
  receiver?: UserMinimalDto;
  type: CallKind;
  status: CallHistoryStatus;
  durationSeconds?: number;
  boxId?: string;
  createdAt: string;
  endedAt?: string;
}

export interface PaginatedCallHistoryDto {
  calls: CallHistoryDto[];
  pagination: PaginationDto;
}

export interface CreateCallRequestDto {
  receiverId: string;
  type: CallKind;
  boxId?: string;
}

export interface UpdateCallStatusRequestDto {
  status: CallHistoryStatus;
  durationSeconds?: number;
}

export interface GetCallHistoryQueryDto extends PaginationParams {
  status?: CallHistoryStatus;
}
