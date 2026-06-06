import { ApiError } from "./api-error";

export function isPostPermissionDeniedError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return (
      error.status === 403 ||
      error.code === "FORBIDDEN" ||
      error.code === "POST_VISIBILITY_FORBIDDEN" ||
      error.code === "POST_PERMISSION_DENIED"
    );
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toUpperCase();
  return (
    message.includes("403") ||
    message.includes("FORBIDDEN") ||
    message.includes("POST_VISIBILITY_FORBIDDEN") ||
    message.includes("POST_PERMISSION_DENIED")
  );
}
