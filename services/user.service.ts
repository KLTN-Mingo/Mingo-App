import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    ApiResponse,
    PublicUserDto,
    UpdateProfileRequestDto,
    UserProfileDto,
} from '@/dtos';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class UserService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_URL}/users${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    const json: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(json.message || 'Something went wrong');
    }

    return json.data;
  }

  // Get current user profile (/me)
  async getCurrentUser(): Promise<UserProfileDto> {
    return this.request<UserProfileDto>('/me');
  }

  // Get public user profile by ID
  async getUserById(userId: string): Promise<PublicUserDto> {
    return this.request<PublicUserDto>(`/${userId}`);
  }

  // Update current user profile
  async updateProfile(payload: UpdateProfileRequestDto): Promise<UserProfileDto> {
    return this.request<UserProfileDto>('/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
}

export const userService = new UserService();