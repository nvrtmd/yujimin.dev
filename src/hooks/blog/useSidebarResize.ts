'use client';

import { useState, useCallback, useRef } from 'react';
import { useDrag } from '@/hooks/useDrag';

export const SIDEBAR_DEFAULT_WIDTH = 200;
const SIDEBAR_MIN_WIDTH = 120;
const SIDEBAR_MAX_WIDTH = 500;

export function useSidebarResize() {
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const startWidthRef = useRef(SIDEBAR_DEFAULT_WIDTH);

  const onDrag = useCallback((deltaX: number) => {
    setSidebarWidth(
      Math.min(
        SIDEBAR_MAX_WIDTH,
        Math.max(SIDEBAR_MIN_WIDTH, startWidthRef.current + deltaX),
      ),
    );
  }, []);

  const { handleMouseDown: startDrag, isDragging } = useDrag({ onDrag });

  const handleSidebarResizeStart = useCallback(
    (e: React.MouseEvent) => {
      startWidthRef.current = sidebarWidth;
      startDrag(e);
    },
    [sidebarWidth, startDrag],
  );

  return {
    sidebarWidth,
    handleSidebarResizeStart,
    isSidebarResizing: isDragging,
  };
}
