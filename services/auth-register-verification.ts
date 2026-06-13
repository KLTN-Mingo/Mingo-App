export type RegisterVerificationChannel = "email" | "phone";
export type RegisterVerificationAction = "send" | "verify";

export const DEFAULT_REGISTER_VERIFICATION_CHANNEL: RegisterVerificationChannel =
  "phone";

export function getAlternateRegisterVerificationChannel(
  channel: RegisterVerificationChannel
): RegisterVerificationChannel {
  return channel === "phone" ? "email" : "phone";
}

export function buildRegisterVerificationEndpoint(
  channel: RegisterVerificationChannel,
  action: RegisterVerificationAction
) {
  const actionPath = action === "send" ? "send-register-otp" : "verify-register-otp";
  return `/${channel}/${actionPath}`;
}

export function buildRegisterVerificationPayload(
  channel: RegisterVerificationChannel,
  value: string
) {
  const trimmed = value.trim();
  return channel === "email" ? { email: trimmed } : { phoneNumber: trimmed };
}
