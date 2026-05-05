import { AuthUserDto, UserProfileDto } from "@/dtos";

export function authUserFromProfile(u: UserProfileDto): AuthUserDto {
  return {
    id: u.id,
    phoneNumber: u.phoneNumber,
    name: u.name,
    avatar: u.avatar,
    role: u.role,
    verified: u.verified,
  };
}
