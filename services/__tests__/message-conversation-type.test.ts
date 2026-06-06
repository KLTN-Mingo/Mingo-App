import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node strip-types requires the explicit TypeScript extension.
import { classifyBoxConversationType } from "../message-conversation-type.ts";

test("group endpoint boxes are always classified as group conversations", () => {
  const type = classifyBoxConversationType(
    {
      groupName: "",
      receiverCount: 2,
    },
    "group"
  );

  assert.equal(type, "GROUP");
});

test("direct endpoint boxes retain legacy shape detection", () => {
  assert.equal(
    classifyBoxConversationType(
      { groupName: "", receiverCount: 2 },
      "direct"
    ),
    "DM"
  );
  assert.equal(
    classifyBoxConversationType(
      { groupName: "Family", receiverCount: 2 },
      "direct"
    ),
    "GROUP"
  );
});
