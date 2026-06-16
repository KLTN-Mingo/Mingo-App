import { useCallback, useEffect, useMemo, useState } from "react";

export function useOtpCooldown(initialSeconds = 60) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining]);

  const startCooldown = useCallback((seconds = initialSeconds) => {
    setRemaining(seconds);
  }, [initialSeconds]);

  const resetCooldown = useCallback(() => {
    setRemaining(0);
  }, []);

  const isCoolingDown = remaining > 0;

  const label = useMemo(() => {
    if (!isCoolingDown) return "Send / Resend code";
    return `Resend in ${remaining}s`;
  }, [isCoolingDown, remaining]);

  return {
    remaining,
    isCoolingDown,
    label,
    startCooldown,
    resetCooldown,
  };
}
