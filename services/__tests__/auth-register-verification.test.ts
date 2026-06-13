import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node strip-types requires the explicit TypeScript extension.
import { DEFAULT_REGISTER_VERIFICATION_CHANNEL, buildRegisterVerificationEndpoint, buildRegisterVerificationPayload, getAlternateRegisterVerificationChannel } from "../auth-register-verification.ts";

test("builds public register OTP endpoints for email and phone", () => {
  assert.equal(
    buildRegisterVerificationEndpoint("email", "send"),
    "/email/send-register-otp"
  );
  assert.equal(
    buildRegisterVerificationEndpoint("email", "verify"),
    "/email/verify-register-otp"
  );
  assert.equal(
    buildRegisterVerificationEndpoint("phone", "send"),
    "/phone/send-register-otp"
  );
  assert.equal(
    buildRegisterVerificationEndpoint("phone", "verify"),
    "/phone/verify-register-otp"
  );
});

test("builds register OTP payloads without auth-only fields", () => {
  assert.deepEqual(buildRegisterVerificationPayload("email", "a@b.com"), {
    email: "a@b.com",
  });
  assert.deepEqual(buildRegisterVerificationPayload("phone", "0912345678"), {
    phoneNumber: "0912345678",
  });
});

test("defaults register verification to phone and allows switching to email", () => {
  assert.equal(DEFAULT_REGISTER_VERIFICATION_CHANNEL, "phone");
  assert.equal(getAlternateRegisterVerificationChannel("phone"), "email");
  assert.equal(getAlternateRegisterVerificationChannel("email"), "phone");
});
