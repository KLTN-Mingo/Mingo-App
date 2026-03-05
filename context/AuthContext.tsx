import { useRouter, useSegments } from 'expo-router';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { AuthUserDto, LoginRequestDto, RegisterRequestDto } from '@/dtos';
import { authService } from '@/services/auth.service';

interface AuthContextProps {
  profile: AuthUserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginRequestDto) => Promise<void>;
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
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!profile && !inAuthGroup) {
      router.replace('/(auth)/signin');
    } else if (profile && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [profile, segments, isLoading]);

  const checkAuth = async () => {
    try {
      const storedUser = await authService.getStoredUser();
      if (storedUser) {
        setProfile(storedUser);
      }
    } catch (error) {
      console.error('Check auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (payload: LoginRequestDto) => {
    const response = await authService.login(payload);
    setProfile(response.user);
  };

  const register = async (payload: RegisterRequestDto) => {
    const response = await authService.register(payload);
    setProfile(response.user);
  };

  const logout = async (allDevices = false) => {
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}