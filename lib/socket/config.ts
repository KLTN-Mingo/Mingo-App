/**
 * Socket server URL – backend Socket.IO chạy cùng host với API, bỏ suffix /api.
 * Ví dụ: EXPO_PUBLIC_API_URL=http://192.168.1.26:3000/api → http://192.168.1.26:3000
 */
export function getSocketUrl(): string {
  const apiUrl =
    (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
    "http://localhost:3000/api";
  return apiUrl.replace(/\/api\/?$/, "") || "http://localhost:3000";
}
