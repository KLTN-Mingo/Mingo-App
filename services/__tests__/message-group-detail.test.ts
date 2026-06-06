import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node strip-types requires the explicit TypeScript extension.
import { normalizeGroupDetail } from "../message-group-detail.ts";

test("normalizes string admin ids and marks matching members as admins", () => {
  const detail = normalizeGroupDetail({
    group: {
      members: [
        { _id: "user-a", name: "A" },
        { _id: "user-b", name: "B" },
      ],
      adminIds: ["user-a"],
      category: "family",
    },
  });

  assert.deepEqual(detail, {
    members: [
      {
        id: "user-a",
        name: "A",
        avatarUrl: undefined,
        role: "admin",
      },
      {
        id: "user-b",
        name: "B",
        avatarUrl: undefined,
        role: "member",
      },
    ],
    category: "family",
  });
});

test("normalizes populated admin ids and direct group payloads", () => {
  const detail = normalizeGroupDetail({
    members: [{ id: "user-a", name: "A", avatarUrl: "avatar" }],
    adminIds: [{ _id: "user-a" }],
    category: "work",
  });

  assert.equal(detail.members[0]?.role, "admin");
  assert.equal(detail.members[0]?.avatarUrl, "avatar");
  assert.equal(detail.category, "work");
});
