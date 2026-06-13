import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node strip-types requires the explicit TypeScript extension.
import { profileFromCompletedTwoFactorLogin } from "../twoFactorLoginProfile.ts";

test("returns user profile from completed 2FA login response", () => {
  const user = {
    id: "user-1",
    phoneNumber: "0912345678",
    role: "user",
    verified: true,
  };

  assert.deepEqual(
    profileFromCompletedTwoFactorLogin({
      accessToken: "access-token",
      user,
    }),
    user
  );
});

test("returns null when completed 2FA response has no access token", () => {
  assert.equal(
    profileFromCompletedTwoFactorLogin({
      accessToken: "",
      user: {
        id: "user-1",
        phoneNumber: "0912345678",
        role: "user",
        verified: true,
      },
    }),
    null
  );
});
