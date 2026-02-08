'use client';

import { useState, useCallback, MouseEvent } from 'react';

const DOUBLE_CLICK_THRESHOLD = 400;

export const useDoubleClick = <T extends React.Key>() => {
  const [lastClickTime, setLastClickTime] = useState(0);
  const [clickedIdentifier, setClickedIdentifier] = useState<T | null>(null);

  const handleDoubleClick = useCallback(
    (e: MouseEvent, identifier: T, onDoubleClick: (id: T) => void) => {
      e.stopPropagation();

      const currentTime = Date.now();
      const isDoubleClick =
        currentTime - lastClickTime < DOUBLE_CLICK_THRESHOLD &&
        clickedIdentifier === identifier;

      if (!isDoubleClick) {
        setClickedIdentifier(identifier);
        setLastClickTime(currentTime);
        return;
      }

      setClickedIdentifier(null);
      onDoubleClick(identifier);
    },
    [lastClickTime, clickedIdentifier],
  );

  const clearSelection = useCallback(() => {
    setClickedIdentifier(null);
  }, []);

  return { handleDoubleClick, clickedIdentifier, clearSelection };
};
