// src/validations/rules.ts

export type T = (key: string, fallback: string) => string;
export type RuleResult = string | undefined;

export const rules = {
  required: (t: T, label: string) =>
    (val: string): RuleResult =>
      !val?.trim()
        ? t("validation.required", `${label} là bắt buộc`).replace("{label}", label)
        : undefined,

  minLength: (t: T, min: number, label: string) =>
    (val: string): RuleResult =>
      (val?.trim().length ?? 0) < min
        ? t("validation.minLength", `${label} tối thiểu ${min} ký tự`)
            .replace("{label}", label)
            .replace("{min}", String(min))
        : undefined,

  email: (t: T) =>
    (val: string): RuleResult =>
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val?.trim())
        ? t("validation.email", "Email không hợp lệ")
        : undefined,

  positiveNumber: (t: T, label: string) =>
    (val: string): RuleResult =>
      !val || parseFloat(val) <= 0
        ? t("validation.positiveNumber", `${label} phải lớn hơn 0`).replace("{label}", label)
        : undefined,

  minNumber: (t: T, min: number, label: string) =>
    (val: string): RuleResult =>
      !val || Number(val) < min
        ? t("validation.minNumber", `${label} tối thiểu ${min}`).replace("{label}", label).replace("{min}", String(min))
        : undefined,

  dateRange: (t: T, startLabel: string, endLabel: string) =>
    (start: string, end: string): RuleResult =>
      start && end && start > end
        ? t(
            "validation.dateRange",
            "{endLabel} không được trước {startLabel}"
          )
            .replace("{startLabel}", startLabel)
            .replace("{endLabel}", endLabel)
        : undefined,

  /** Số điện thoại: chỉ kiểm tra khi đã có ký tự; đếm chữ số sau khi bỏ ký tự không phải số. */
  phoneDigitsLength:
    (t: T, min: number, max: number, label: string) =>
    (val: string): RuleResult => {
      const trimmed = val?.trim() ?? "";
      if (!trimmed) return undefined;
      const digits = trimmed.replace(/\D/g, "");
      if (digits.length < min || digits.length > max) {
        return t("validation.phoneDigits", "{label}: {min}-{max} digits")
          .replace("{label}", label)
          .replace("{min}", String(min))
          .replace("{max}", String(max));
      }
      return undefined;
    },

  pipe:
    (...fns: Array<(val: string) => RuleResult>) =>
    (val: string): RuleResult => {
      for (const fn of fns) {
        const err = fn(val);
        if (err) return err;
      }
      return undefined;
    },
};
