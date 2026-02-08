'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Dispatch } from 'react';
import { Position, Size, WindowState } from '@/models';

const INITIAL_POSITION: Position = { x: 0, y: 0 };
const INITIAL_SIZE: Size = { width: 0, height: 0 };

interface ResizeState {
  isResizing: boolean;
  direction: string;
  window: WindowState | null;
  mouseStartPosition: Position;
  windowStartSize: Size;
  windowStartPosition: Position;
}

export const WINDOW_MIN_WIDTH = 290;
export const WINDOW_MIN_HEIGHT = 270;

export const WINDOW_MEDIUM_WIDTH = 600;
export const WINDOW_MEDIUM_HEIGHT = 480;

export const WINDOW_DEFAULT_WIDTH = 800;
export const WINDOW_DEFAULT_HEIGHT = 600;

const INITIAL_RESIZE_STATE: ResizeState = {
  isResizing: false,
  direction: '',
  window: null,
  mouseStartPosition: INITIAL_POSITION,
  windowStartSize: INITIAL_SIZE,
  windowStartPosition: INITIAL_POSITION,
};

export const useWindowResize = (
  setWindowList: Dispatch<React.SetStateAction<WindowState[]>>,
  bringToFront: (window: WindowState) => void,
) => {
  const [resizeState, setResizeState] =
    useState<ResizeState>(INITIAL_RESIZE_STATE);
  const rafId = useRef<number | null>(null);

  const calculateEastResize = useCallback(
    (deltaX: number, startSize: Size): Partial<Size> => ({
      width: Math.max(WINDOW_MIN_WIDTH, startSize.width + deltaX),
    }),
    [],
  );

  const calculateSouthResize = useCallback(
    (deltaY: number, startSize: Size): Partial<Size> => ({
      height: Math.max(WINDOW_MIN_HEIGHT, startSize.height + deltaY),
    }),
    [],
  );

  const calculateWestResize = useCallback(
    (
      deltaX: number,
      startSize: Size,
      startPosition: Position,
    ): { size: Partial<Size>; position: Partial<Position> } => {
      const newWidth = Math.max(WINDOW_MIN_WIDTH, startSize.width - deltaX);
      return {
        size: { width: newWidth },
        position: { x: startPosition.x + (startSize.width - newWidth) },
      };
    },
    [],
  );

  const calculateNorthResize = useCallback(
    (
      deltaY: number,
      startSize: Size,
      startPosition: Position,
    ): { size: Partial<Size>; position: Partial<Position> } => {
      const newHeight = Math.max(WINDOW_MIN_HEIGHT, startSize.height - deltaY);
      return {
        size: { height: newHeight },
        position: { y: startPosition.y + (startSize.height - newHeight) },
      };
    },
    [],
  );

  const calculateNewSizeAndPosition = useCallback(
    (
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
    },
    [
      calculateEastResize,
      calculateSouthResize,
      calculateWestResize,
      calculateNorthResize,
    ],
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, window: WindowState, direction: string) => {
      e.preventDefault();
      e.stopPropagation();

      bringToFront(window);

      setResizeState({
        isResizing: true,
        window,
        direction,
        mouseStartPosition: { x: e.clientX, y: e.clientY },
        windowStartSize: window.size,
        windowStartPosition: window.position,
      });
    },
    [bringToFront],
  );

  const handleResizeMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeState.isResizing || !resizeState.window) {
        return;
      }

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const deltaX = e.clientX - resizeState.mouseStartPosition.x;
        const deltaY = e.clientY - resizeState.mouseStartPosition.y;

        const { size: newSize, position: newPosition } =
          calculateNewSizeAndPosition(
            resizeState.direction,
            deltaX,
            deltaY,
            resizeState.windowStartSize,
            resizeState.windowStartPosition,
          );

        setWindowList((prev) =>
          prev.map((window) =>
            window.id === resizeState.window?.id
              ? { ...window, size: newSize, position: newPosition }
              : window,
          ),
        );
      });
    },
    [resizeState, setWindowList, calculateNewSizeAndPosition],
  );

  const handleResizeMouseUp = useCallback(() => {
    setResizeState(INITIAL_RESIZE_STATE);
  }, []);

  useEffect(() => {
    if (!resizeState.isResizing) {
      return;
    }

    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [resizeState.isResizing, handleResizeMouseMove, handleResizeMouseUp]);

  return { handleResizeMouseDown };
};
