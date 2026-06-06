import AsyncStorage from "@react-native-async-storage/async-storage";

import { authService } from "@/services/auth.service";
import { ApiError } from "@/services/api-error";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  code?: string;
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

// Singleton promise: N request 401 đồng thời chỉ trigger 1 lần refresh.
let refreshPromise: Promise<string | null> | null = null;

async function refreshOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = authService
      .refreshAccessToken()
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/** Chặn refresh đệ quy nếu chính endpoint refresh / login fail 401. */
function isRefreshableEndpoint(path: string): boolean {
  return (
    !path.includes("/auth/refresh-token") &&
    !path.includes("/auth/login") &&
    !path.includes("/auth/register") &&
    !path.includes("/auth/forgot-password") &&
    !path.includes("/auth/reset-password")
  );
}

async function parseJson<T>(response: Response): Promise<ApiEnvelope<T>> {
  try {
    const text = await response.text();
    return text ? (JSON.parse(text) as ApiEnvelope<T>) : {};
  } catch {
    throw new Error("Phản hồi từ máy chủ không hợp lệ");
  }
}

export async function apiMultipartRequest<T>(
  path: string,
  formData: FormData,
  _retry = false
): Promise<T> {
  const headers = await getAuthHeadersMultipart();
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  if (response.status === 401 && !_retry && isRefreshableEndpoint(path)) {
    const newToken = await refreshOnce();
    if (newToken) return apiMultipartRequest<T>(path, formData, true);
  }

  const json = await parseJson<T>(response);
  const message = json.message || "Something went wrong";
  if (!response.ok) {
    await authService.handleUnauthorizedResponse(response, message);
    throw new ApiError(message, {
      status: response.status,
      code: json.code,
    });
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
  options: RequestInit = {},
  _retry = false
): Promise<T> {
  const headers = await getAuthHeaders(options.headers);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && !_retry && isRefreshableEndpoint(path)) {
    const newToken = await refreshOnce();
    if (newToken) return apiRequest<T>(path, options, true);
  }

  const json = await parseJson<T>(response);
  const message = json.message || "Something went wrong";
  if (!response.ok) {
    await authService.handleUnauthorizedResponse(response, message);
    throw new ApiError(message, {
      status: response.status,
      code: json.code,
    });
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
