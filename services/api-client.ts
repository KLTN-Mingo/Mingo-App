import AsyncStorage from "@react-native-async-storage/async-storage";

import { ApiError } from "@/services/api-error";
import { authService } from "@/services/auth.service";
import {
  createRefreshGate,
  sendWithAutoRefresh,
} from "@/services/auth-refresh";

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

const refreshAccessTokenOnce = createRefreshGate(() =>
  authService.refreshAccessToken()
);

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

// FormData should not set Content-Type so fetch can add its boundary.
export async function getAuthHeadersMultipart(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("accessToken");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseJson<T>(response: Response): Promise<ApiEnvelope<T>> {
  try {
    const text = await response.text();
    return text ? (JSON.parse(text) as ApiEnvelope<T>) : {};
  } catch {
    throw new Error("Invalid server response");
  }
}

export async function apiMultipartRequest<T>(
  path: string,
  formData: FormData,
  retry = false
): Promise<T> {
  const response = await sendWithAutoRefresh({
    path,
    retry,
    refreshAccessTokenOnce,
    send: async () => {
      const headers = await getAuthHeadersMultipart();
      return fetch(`${API_URL}${path}`, {
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
      });
    },
  });

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
  retry = false
): Promise<T> {
  const response = await sendWithAutoRefresh({
    path,
    retry,
    refreshAccessTokenOnce,
    send: async () => {
      const headers = await getAuthHeaders(options.headers);
      return fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
      });
    },
  });

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
