/**
 * Map giữa app DTO và backend socket payload (Mingo-BE src/socket/socket.types).
 * Backend dùng SocketUser: { userId, socketId, name?, avatar? } (không có profile wrapper).
 */

import type { Participants, SocketUser } from "@/dtos/call.dto";

export interface BackendSocketUser {
  userId: string;
  socketId: string;
  name?: string;
  avatar?: string;
}

export interface BackendCallParticipants {
  caller: BackendSocketUser;
  receiver: BackendSocketUser;
}

export interface BackendOngoingCall {
  participants: BackendCallParticipants;
  boxId?: string;
  isVideoCall: boolean;
}

export function toBackendParticipants(participants: Participants): BackendCallParticipants {
  return {
    caller: {
      userId: participants.caller.userId,
      socketId: participants.caller.socketId,
      name: participants.caller.profile.name,
      avatar: participants.caller.profile.avatar,
    },
    receiver: {
      userId: participants.receiver.userId,
      socketId: participants.receiver.socketId,
      name: participants.receiver.profile.name,
      avatar: participants.receiver.profile.avatar,
    },
  };
}

export function toAppSocketUser(backend: BackendSocketUser): SocketUser {
  return {
    userId: backend.userId,
    socketId: backend.socketId,
    profile: {
      id: backend.userId,
      name: backend.name,
      avatar: backend.avatar,
    },
  };
}

export function toAppParticipants(backend: BackendCallParticipants): Participants {
  return {
    caller: toAppSocketUser(backend.caller),
    receiver: toAppSocketUser(backend.receiver),
  };
}
