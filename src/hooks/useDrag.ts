'use client';

import {
  useState,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
} from 'react';

interface UseDragOptions {
  onDrag: (deltaX: number, deltaY: number) => void;
}

/**
 * Primitive hook for drag interactions.
 * Handles mousemove/mouseup listeners and rAF throttling.
 * Calls onDrag(deltaX, deltaY) with cumulative delta from the drag start position.
 */
export function useDrag({ onDrag }: UseDragOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  }, []);

  const onMouseMove = useEffectEvent((e: MouseEvent) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      onDrag(deltaX, deltaY);
    });
  });

  const onMouseUp = useEffectEvent(() => {
    setIsDragging(false);
  });

  useEffect(() => {
    if (!isDragging) return;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isDragging]);

  return { handleMouseDown, isDragging };
}
