'use client';

import { useCallback, useRef } from 'react';
import type { Dispatch } from 'react';
import { Position, Size, WindowState } from '@/models';
import { useDrag } from '@/hooks/useDrag';

export const WINDOW_MIN_WIDTH = 290;
export const WINDOW_MIN_HEIGHT = 270;

export const WINDOW_MEDIUM_WIDTH = 600;
export const WINDOW_MEDIUM_HEIGHT = 480;

export const WINDOW_DEFAULT_WIDTH = 800;
export const WINDOW_DEFAULT_HEIGHT = 600;

const calculateEastResize = (
  deltaX: number,
  startSize: Size,
): Partial<Size> => ({
  width: Math.max(WINDOW_MIN_WIDTH, startSize.width + deltaX),
});

const calculateSouthResize = (
  deltaY: number,
  startSize: Size,
): Partial<Size> => ({
  height: Math.max(WINDOW_MIN_HEIGHT, startSize.height + deltaY),
});

const calculateWestResize = (
  deltaX: number,
  startSize: Size,
  startPosition: Position,
): { size: Partial<Size>; position: Partial<Position> } => {
  const newWidth = Math.max(WINDOW_MIN_WIDTH, startSize.width - deltaX);
  return {
    size: { width: newWidth },
    position: { x: startPosition.x + (startSize.width - newWidth) },
  };
};

const calculateNorthResize = (
  deltaY: number,
  startSize: Size,
  startPosition: Position,
): { size: Partial<Size>; position: Partial<Position> } => {
  const newHeight = Math.max(WINDOW_MIN_HEIGHT, startSize.height - deltaY);
  return {
    size: { height: newHeight },
    position: { y: startPosition.y + (startSize.height - newHeight) },
  };
};

const calculateNewSizeAndPosition = (
  direction: string,
  deltaX: number,
  deltaY: number,
  startSize: Size,
  startPosition: Position,
): { size: Size; position: Position } => {
  const newSize = { ...startSize };
  const newPosition = { ...startPosition };

  if (direction.includes('e')) {
    Object.assign(newSize, calculateEastResize(deltaX, startSize));
  }

  if (direction.includes('s')) {
    Object.assign(newSize, calculateSouthResize(deltaY, startSize));
  }

  if (direction.includes('w')) {
    const result = calculateWestResize(deltaX, startSize, startPosition);
    Object.assign(newSize, result.size);
    Object.assign(newPosition, result.position);
  }

  if (direction.includes('n')) {
    const result = calculateNorthResize(deltaY, startSize, startPosition);
    Object.assign(newSize, result.size);
    Object.assign(newPosition, result.position);
  }

  return { size: newSize, position: newPosition };
};

interface DragStartState {
  window: WindowState;
  direction: string;
  startSize: Size;
  startPosition: Position;
}

export const useWindowResize = (
  setWindowList: Dispatch<React.SetStateAction<WindowState[]>>,
  bringToFront: (window: WindowState) => void,
) => {
  const dragStartState = useRef<DragStartState | null>(null);

  const onDrag = useCallback(
    (deltaX: number, deltaY: number) => {
      const state = dragStartState.current;
      if (!state) return;

      const { size: newSize, position: newPosition } =
        calculateNewSizeAndPosition(
          state.direction,
          deltaX,
          deltaY,
          state.startSize,
          state.startPosition,
        );

      setWindowList((prev) =>
        prev.map((window) =>
          window.id === state.window.id
            ? { ...window, size: newSize, position: newPosition }
            : window,
        ),
      );
    },
    [setWindowList],
  );

  const { handleMouseDown: startDrag } = useDrag({ onDrag });

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, window: WindowState, direction: string) => {
      e.stopPropagation();
      bringToFront(window);
      dragStartState.current = {
        window,
        direction,
        startSize: window.size,
        startPosition: window.position,
      };
      startDrag(e);
    },
    [bringToFront, startDrag],
  );

  return { handleResizeMouseDown };
};
