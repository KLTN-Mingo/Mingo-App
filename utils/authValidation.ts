type FieldValue = string | undefined | null;
type FieldValuesShape = object;
type FieldName<TValues extends FieldValuesShape> = Extract<keyof TValues, string>;

type ConfirmPasswordRule<TValues extends FieldValuesShape> = {
  type: "confirmPassword";
  matchesField: FieldName<TValues>;
};

export type AuthValidationRule<TValues extends FieldValuesShape> =
  | "required"
  | "phone"
  | "email"
  | "otp"
  | "password"
  | ConfirmPasswordRule<TValues>;

export type AuthValidationSchema<TValues extends FieldValuesShape> = {
  [K in FieldName<TValues>]?: {
    label?: string;
    rules: AuthValidationRule<TValues>[];
  };
};

export type AuthValidationErrors<TValues extends FieldValuesShape> =
  Partial<Record<FieldName<TValues>, string>>;

const PHONE_REGEX = /^[0-9]{10,11}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{4,6}$/;

const trimValue = (value: FieldValue) => value?.trim() ?? "";

export function validateAuthFields<TValues extends FieldValuesShape>(
  values: TValues,
  schema: AuthValidationSchema<TValues>
): AuthValidationErrors<TValues> {
  const errors: AuthValidationErrors<TValues> = {};

  for (const [field, rules] of Object.entries(schema) as [
    FieldName<TValues>,
    AuthValidationSchema<TValues>[FieldName<TValues>] | undefined
  ][]) {
    if (!rules?.rules.length) continue;

    const value = trimValue(values[field] as FieldValue);

    for (const rule of rules.rules) {
      const error = getRuleError(rule, value, values, rules.label);

      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return errors;
}

function getRuleError<TValues extends FieldValuesShape>(
  rule: AuthValidationRule<TValues>,
  value: string,
  values: TValues,
  label?: string
): string | undefined {
  if (rule === "required") {
    return value ? undefined : `Please enter your ${label ?? "required information"}`;
  }

  if (rule === "phone") {
    if (!value) return undefined;
    return PHONE_REGEX.test(value)
      ? undefined
      : "Please enter a valid phone number";
  }

  if (rule === "email") {
    if (!value) return undefined;
    return EMAIL_REGEX.test(value)
      ? undefined
      : "Please enter a valid email address";
  }

  if (rule === "otp") {
    if (!value) return undefined;
    return OTP_REGEX.test(value)
      ? undefined
      : "Please enter a valid verification code";
  }

  if (rule === "password") {
    if (!value) return undefined;
    return value.length >= 6
      ? undefined
      : "Password must be at least 6 characters";
  }

  const compareValue = trimValue(values[rule.matchesField] as FieldValue);
  return value === compareValue ? undefined : "Passwords do not match";
}
