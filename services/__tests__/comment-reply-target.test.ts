import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node strip-types requires the explicit TypeScript extension.
import { getReplyTarget } from "../comment-reply-target.ts";

test("uses the selected root comment as reply target and original comment", () => {
  assert.deepEqual(
    getReplyTarget({
      id: "root-1",
      user: { name: "Alice" },
    }),
    {
      id: "root-1",
      originalCommentId: "root-1",
      name: "Alice",
    }
  );
});

test("keeps original comment id when replying to a nested reply", () => {
  assert.deepEqual(
    getReplyTarget({
      id: "reply-1",
      parentCommentId: "parent-1",
      originalCommentId: "root-1",
      user: { name: "Bob" },
    }),
    {
      id: "reply-1",
      originalCommentId: "root-1",
      name: "Bob",
    }
  );
});
