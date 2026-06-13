import { useRouter, useSegments } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { AuthUserDto, LoginRequestDto, RegisterRequestDto } from "@/dtos";
import { authService } from "@/services/auth.service";
import { deviceService } from "@/services/device.service";
import { userService } from "@/services/user.service";

interface AuthContextProps {
  profile: AuthUserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /**
   * Trả về `{ requiresTwoFactor, pendingToken }` khi BE yêu cầu 2FA — caller
   * phải redirect tới `/(auth)/two-factor` để hoàn tất login.
   */
  login: (payload: LoginRequestDto) => Promise<{
    requiresTwoFactor: boolean;
    pendingToken?: string;
  }>;
  register: (payload: RegisterRequestDto) => Promise<void>;
  logout: (allDevices?: boolean) => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<AuthUserDto | null>>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AuthUserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    authService.setUnauthorizedHandler(() => {
      setProfile(null);
    });

    return () => {
      authService.setUnauthorizedHandler();
    };
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!profile && !inAuthGroup) {
      router.replace("/(auth)/signin");
    } else if (profile && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [profile, segments, isLoading, router]);

  const checkAuth = async () => {
    try {
      let token = await authService.getAccessToken();
      if (!token) {
        token = await authService.refreshAccessToken();
      }

      if (!token) {
        setProfile(null);
        return;
      }

      const currentUser = await userService.getCurrentUser();
      if (!currentUser.isActive || currentUser.isBlocked) {
        await authService.clearSession();
        setProfile(null);
        return;
      }

      setProfile({
        id: currentUser.id,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.role,
        verified: currentUser.verified,
      });

    } catch (error) {
      console.error("Check auth error:", error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (payload: LoginRequestDto) => {
    const response = await authService.login(payload);
    if (response.requiresTwoFactor) {
      return {
        requiresTwoFactor: true,
        pendingToken: response.pendingToken,
      };
    }
    const currentUser = await userService.getCurrentUser().catch(() => null);
    if (currentUser && (!currentUser.isActive || currentUser.isBlocked)) {
      await authService.clearSession();
      setProfile(null);
      throw new Error("Tài khoản của bạn hiện không khả dụng");
    }

    setProfile(
      currentUser
        ? {
            id: currentUser.id,
            email: currentUser.email,
            phoneNumber: currentUser.phoneNumber,
            name: currentUser.name,
            avatar: currentUser.avatar,
            role: currentUser.role,
            verified: currentUser.verified,
          }
        : response.user
    );
    return { requiresTwoFactor: false };
  };

  const register = async (payload: RegisterRequestDto) => {
    const response = await authService.register(payload);
    setProfile(response.user);
  };

  const logout = async (allDevices = false) => {
    // Unregister push token trước khi logout — best-effort, không block flow.
    try {
      const Notifications = await import("expo-notifications");
      const token = await Notifications.getDevicePushTokenAsync().catch(() => null);
      if (token?.data && typeof token.data === "string") {
        await deviceService.unregisterDevice(token.data).catch(() => undefined);
      }
    } catch {
      // expo-notifications may not be available (Expo Go); ignore.
    }

    await authService.logout(allDevices);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        isLoading,
        isAuthenticated: !!profile,
        login,
        register,
        logout,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
