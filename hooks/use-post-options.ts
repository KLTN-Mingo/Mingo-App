import React, { useCallback, useState } from "react";

import {
  PostOption,
  PostOptionsModal,
} from "../components/post/PostOptionsModal";

interface UsePostOptionsResult {
  openOptions: (options: PostOption[]) => void;
  modal: React.ReactNode;
}

export function usePostOptions(): UsePostOptionsResult {
  const [options, setOptions] = useState<PostOption[] | null>(null);

  const openOptions = useCallback((opts: PostOption[]) => {
    setOptions(opts);
  }, []);

  const handleClose = useCallback(() => setOptions(null), []);

  const modal = options
    ? React.createElement(PostOptionsModal, {
        visible: true,
        options,
        onClose: handleClose,
      })
    : null;

  return { openOptions, modal };
}
