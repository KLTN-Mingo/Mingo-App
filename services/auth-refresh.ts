const NON_REFRESHABLE_ENDPOINTS = [
  "/auth/refresh-token",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export function isRefreshableEndpoint(path: string): boolean {
  const normalizedPath = path.toLowerCase();
  return !NON_REFRESHABLE_ENDPOINTS.some((endpoint) =>
    normalizedPath.includes(endpoint)
  );
}

export function createRefreshGate(
  refreshAccessToken: () => Promise<string | null>
): () => Promise<string | null> {
  let refreshPromise: Promise<string | null> | null = null;

  return async () => {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    return refreshPromise;
  };
}

export async function sendWithAutoRefresh({
  path,
  send,
  refreshAccessTokenOnce,
  retry = false,
}: {
  path: string;
  send: () => Promise<Response>;
  refreshAccessTokenOnce: () => Promise<string | null>;
  retry?: boolean;
}): Promise<Response> {
  const response = await send();

  if (
    response.status !== 401 ||
    retry ||
    !isRefreshableEndpoint(path)
  ) {
    return response;
  }

  const refreshedToken = await refreshAccessTokenOnce();
  if (!refreshedToken) {
    return response;
  }

  return send();
}
