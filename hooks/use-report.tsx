import React, { useCallback, useState } from "react";

import { ReportEntityModal } from "@/components/post/ReportEntityModal";
import { ReportEntityType } from "@/dtos";

interface ReportTarget {
  entityType: ReportEntityType;
  entityId: string;
  entityLabel?: string;
}

interface UseReportResult {
  /** Mở modal báo cáo cho entity bất kỳ. */
  openReport: (target: ReportTarget) => void;
  /** Render modal — đặt vào cuối screen. */
  modal: React.ReactNode;
}

/**
 * Hook tiện ích: cung cấp 1 `openReport` + JSX `modal` để gắn vào screen.
 * Khoá nội bộ state — caller chỉ cần gọi `openReport({ entityType, entityId })`.
 */
export function useReport(): UseReportResult {
  const [target, setTarget] = useState<ReportTarget | null>(null);

  const openReport = useCallback((t: ReportTarget) => {
    setTarget(t);
  }, []);

  const handleClose = useCallback(() => setTarget(null), []);

  const modal = target ? (
    <ReportEntityModal
      visible
      entityType={target.entityType}
      entityId={target.entityId}
      entityLabel={target.entityLabel}
      onClose={handleClose}
    />
  ) : null;

  return { openReport, modal };
}
