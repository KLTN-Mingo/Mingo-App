// Call / WebRTC socket DTOs – aligned with (modals) base implementation

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
