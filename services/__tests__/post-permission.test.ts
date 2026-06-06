import assert from "node:assert/strict";
import test from "node:test";

import { ApiError } from "../api-error";
import { isPostPermissionDeniedError } from "../post-permission";

test("post permission helper treats 403 api errors as access loss", () => {
  const error = new ApiError("Forbidden", { status: 403, code: "FORBIDDEN" });

  assert.equal(isPostPermissionDeniedError(error), true);
});

test("post permission helper falls back to message heuristics for legacy errors", () => {
  assert.equal(
    isPostPermissionDeniedError(
      new Error("POST_VISIBILITY_FORBIDDEN: user cannot access this post")
    ),
    true
  );
  assert.equal(isPostPermissionDeniedError(new Error("network timeout")), false);
});
