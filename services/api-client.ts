import AsyncStorage from "@react-native-async-storage/async-storage";

import { authService } from "@/services/auth.service";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  result?: T;
  payload?: T;
  user?: T;
};

function extractData<T>(json: ApiEnvelope<T>): T | undefined {
  if (json.data !== undefined) return json.data;
  if (json.result !== undefined) return json.result;
  if (json.payload !== undefined) return json.payload;
  if (json.user !== undefined) return json.user;
  return undefined;
}

export async function getAuthHeaders(
  extraHeaders?: HeadersInit
): Promise<HeadersInit> {
  const token = await AsyncStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

/** FormData: không set Content-Type để fetch tự thêm boundary. */
export async function getAuthHeadersMultipart(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("accessToken");
  const h: Record<string, string> = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function apiMultipartRequest<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const headers = await getAuthHeadersMultipart();
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  let json: ApiEnvelope<T> = {};
  try {
    const text = await response.text();
    json = text ? (JSON.parse(text) as ApiEnvelope<T>) : {};
  } catch {
    throw new Error("Phản hồi từ máy chủ không hợp lệ");
  }

  const message = json.message || "Something went wrong";
  if (!response.ok) {
    await authService.handleUnauthorizedResponse(response, message);
    throw new Error(message);
  }

  const data = extractData<T>(json);
  if (data === undefined) {
    if (response.status === 204 || response.status === 205) {
      return undefined as T;
    }
    return null as T;
  }
  return data;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders(options.headers);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  let json: ApiEnvelope<T> = {};
  try {
    const text = await response.text();
    json = text ? (JSON.parse(text) as ApiEnvelope<T>) : {};
  } catch {
    throw new Error("Phản hồi từ máy chủ không hợp lệ");
  }

  const message = json.message || "Something went wrong";
  if (!response.ok) {
    await authService.handleUnauthorizedResponse(response, message);
    throw new Error(message);
  }

  const data = extractData<T>(json);
  if (data === undefined) {
    if ((response.status === 204 || response.status === 205) as boolean) {
      return undefined as T;
    }
    return null as T;
  }
  return data;
}
