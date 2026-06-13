import type { AuthResponseDto, AuthUserDto } from "../dtos/auth.dto";

export function profileFromCompletedTwoFactorLogin(
  response: AuthResponseDto
): AuthUserDto | null {
  if (!response.accessToken || !response.user) {
    return null;
  }

  return response.user;
}
