import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node strip-types requires the explicit TypeScript extension.
import { validateAuthFields } from "../authValidation.ts";

test("returns English auth validation messages", () => {
  const errors = validateAuthFields(
    {
      phoneNumber: "abc",
      email: "invalid-email",
      password: "123",
      confirmPassword: "456",
      code: "12",
      name: "",
    },
    {
      name: {
        label: "full name",
        rules: ["required"],
      },
      phoneNumber: {
        label: "phone number",
        rules: ["required", "phone"],
      },
      email: {
        label: "email address",
        rules: ["required", "email"],
      },
      password: {
        label: "password",
        rules: ["required", "password"],
      },
      confirmPassword: {
        label: "confirm password",
        rules: ["required", { type: "confirmPassword", matchesField: "password" }],
      },
      code: {
        label: "verification code",
        rules: ["required", "otp"],
      },
    }
  );

  assert.deepEqual(errors, {
    name: "Please enter your full name",
    phoneNumber: "Please enter a valid phone number",
    email: "Please enter a valid email address",
    password: "Password must be at least 6 characters",
    confirmPassword: "Passwords do not match",
    code: "Please enter a valid verification code",
  });
});
