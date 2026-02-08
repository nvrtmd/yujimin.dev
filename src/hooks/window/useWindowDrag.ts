'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { SetStateAction, Dispatch } from 'react';
import type { App, Position, WindowState } from '@/models';

const INITIAL_POSITION: Position = { x: 0, y: 0 };

interface DragState {
  isDragging: boolean;
  window: WindowState | null;
  mouseStartPosition: Position;
  windowStartPosition: Position;
}

interface UseWindowDragProps {
  setWindowList: Dispatch<SetStateAction<WindowState[]>>;
  bringToFront: (app: App) => void;
}

const INITIAL_DRAG_STATE: DragState = {
  isDragging: false,
  window: null,
  mouseStartPosition: INITIAL_POSITION,
  windowStartPosition: INITIAL_POSITION,
};

export const useWindowDrag = ({
  setWindowList,
  bringToFront,
}: UseWindowDragProps) => {
  const [dragState, setDragState] = useState<DragState>(INITIAL_DRAG_STATE);
  const rafId = useRef<number | null>(null);

  const calculateNewPosition = useCallback(
    (mouseEvent: MouseEvent): Position => {
      const deltaX = mouseEvent.clientX - dragState.mouseStartPosition.x;
      const deltaY = mouseEvent.clientY - dragState.mouseStartPosition.y;

      return {
        x: dragState.windowStartPosition.x + deltaX,
        y: dragState.windowStartPosition.y + deltaY,
      };
    },
    [dragState.mouseStartPosition, dragState.windowStartPosition],
  );

  const updateWindowPosition = useCallback(
    (newPosition: Position) => {
      setWindowList((prevWindows) =>
        prevWindows.map((w) =>
          w.id === dragState.window?.id ? { ...w, position: newPosition } : w,
        ),
      );
    },
    [dragState.window?.id, setWindowList],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !dragState.window) {
        return;
      }

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const newPosition = calculateNewPosition(e);
        updateWindowPosition(newPosition);
      });
    },
    [
      dragState.isDragging,
      dragState.window,
      calculateNewPosition,
      updateWindowPosition,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setDragState(INITIAL_DRAG_STATE);
  }, []);

  const handleWindowDragMouseDown = useCallback(
    (e: React.MouseEvent, window: WindowState) => {
      bringToFront(window);

      setDragState({
        isDragging: true,
        window,
        mouseStartPosition: { x: e.clientX, y: e.clientY },
        windowStartPosition: window.position,
      });
    },
    [bringToFront],
  );

  useEffect(() => {
    if (!dragState.isDragging) {
      return;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return { handleWindowDragMouseDown };
};
