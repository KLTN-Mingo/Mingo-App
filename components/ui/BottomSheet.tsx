// Refactored: added a stable bottom-sheet facade for tokenized modal sheets.
import type { ReactNode } from "react";

import { AppModal } from "./AppModal";

interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
}

export function BottomSheet({ visible, onDismiss, children }: BottomSheetProps) {
  return (
    <AppModal visible={visible} onDismiss={onDismiss}>
      {children}
    </AppModal>
  );
}
