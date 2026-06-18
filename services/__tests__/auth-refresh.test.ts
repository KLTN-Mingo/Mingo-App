import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node strip-types requires the explicit TypeScript extension.
import {
  createRefreshGate,
  isRefreshableEndpoint,
  sendWithAutoRefresh,
} from "../auth-refresh.ts";

function createJsonResponse(status: number, body: Record<string, unknown> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

test("retries a protected request once after refreshing the access token", async () => {
  let attempts = 0;
  let refreshCalls = 0;

  const refreshAccessTokenOnce = createRefreshGate(async () => {
    refreshCalls += 1;
    return "new-access-token";
  });

  const response = await sendWithAutoRefresh({
    path: "/users/me",
    refreshAccessTokenOnce,
    send: async () => {
      attempts += 1;
      return attempts === 1
        ? createJsonResponse(401, { message: "jwt expired" })
        : createJsonResponse(200, { data: { id: "u_1" } });
    },
  });

  assert.equal(response.status, 200);
  assert.equal(attempts, 2);
  assert.equal(refreshCalls, 1);
});

test("does not refresh excluded auth endpoints or requests already retried", async () => {
  let refreshCalls = 0;

  const refreshAccessTokenOnce = createRefreshGate(async () => {
    refreshCalls += 1;
    return "new-access-token";
  });

  const refreshResponse = await sendWithAutoRefresh({
    path: "/auth/refresh-token",
    refreshAccessTokenOnce,
    send: async () => createJsonResponse(401, { message: "unauthorized" }),
  });

  const retriedResponse = await sendWithAutoRefresh({
    path: "/users/me",
    retry: true,
    refreshAccessTokenOnce,
    send: async () => createJsonResponse(401, { message: "still unauthorized" }),
  });

  assert.equal(refreshResponse.status, 401);
  assert.equal(retriedResponse.status, 401);
  assert.equal(refreshCalls, 0);
  assert.equal(isRefreshableEndpoint("/auth/refresh-token"), false);
  assert.equal(isRefreshableEndpoint("/auth/login"), false);
  assert.equal(isRefreshableEndpoint("/users/me"), true);
});

test("coalesces concurrent refresh attempts so only one refresh request runs", async () => {
  let refreshCalls = 0;
  let sendCalls = 0;

  const refreshAccessTokenOnce = createRefreshGate(async () => {
    refreshCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return "new-access-token";
  });

  const send = async () => {
    sendCalls += 1;
    return sendCalls <= 2
      ? createJsonResponse(401, { message: "jwt expired" })
      : createJsonResponse(200, { data: { ok: true } });
  };

  const [first, second] = await Promise.all([
    sendWithAutoRefresh({
      path: "/users/me",
      refreshAccessTokenOnce,
      send,
    }),
    sendWithAutoRefresh({
      path: "/users/me",
      refreshAccessTokenOnce,
      send,
    }),
  ]);

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(refreshCalls, 1);
  assert.equal(sendCalls, 4);
});
