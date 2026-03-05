import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    ApiResponse,
    AuthResponseDto,
    AuthUserDto,
    LoginRequestDto,
    RegisterRequestDto,
} from '@/dtos';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class AuthService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}/auth${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    const json: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(json.message || 'Something went wrong');
    }

    return json.data;
  }

  async register(payload: RegisterRequestDto): Promise<AuthResponseDto> {
    const response = await this.request<AuthResponseDto>('/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    await AsyncStorage.setItem('accessToken', response.accessToken);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));

    return response;
  }

  async login(payload: LoginRequestDto): Promise<AuthResponseDto> {
    const response = await this.request<AuthResponseDto>('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    await AsyncStorage.setItem('accessToken', response.accessToken);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));

    return response;
  }

  async logout(allDevices = false): Promise<void> {
    const token = await AsyncStorage.getItem('accessToken');

    try {
      await this.request('/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ allDevices }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local storage
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('user');
  }

  async getStoredUser(): Promise<AuthUserDto | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem('accessToken');
  }
}

export const authService = new AuthService();