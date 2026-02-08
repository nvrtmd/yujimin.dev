'use client';

import { useState, useCallback } from 'react';
import { App, WindowState } from '@/models';
import { getContent } from '@/libs';
import { useMobile } from '@/hooks/useMobile';
import { WINDOW_DEFAULT_WIDTH, WINDOW_DEFAULT_HEIGHT } from './useWindowResize';
import { TASKBAR_HEIGHT } from '@/libs/iconLayout';

const WINDOW_MARGIN = 10;
const INITIAL_Z_INDEX = 0;
const CASCADE_OFFSET = 20;
const INITIAL_POSITION_OFFSET = 80;

export const useWindowState = () => {
  const [windowList, setWindowList] = useState<WindowState[]>([]);
  const [highestZIndex, setHighestZIndex] = useState(INITIAL_Z_INDEX);
  const isMobile = useMobile();

  const getClientArea = useCallback(() => {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
  }, []);

  const constrainSize = useCallback(
    (size: { width: number; height: number }) => {
      if (typeof window === 'undefined') {
        return size;
      }

      const { width: clientWidth, height: clientHeight } = getClientArea();
      const maxAvailableWidth = clientWidth - WINDOW_MARGIN * 2;
      const maxAvailableHeight =
        clientHeight - TASKBAR_HEIGHT - WINDOW_MARGIN * 2;

      return {
        width: Math.min(size.width, maxAvailableWidth),
        height: Math.min(size.height, maxAvailableHeight),
      };
    },
    [getClientArea],
  );

  const constrainPosition = useCallback(
    (
      pos: { x: number; y: number },
      size: { width: number; height: number },
    ) => {
      if (typeof window === 'undefined') {
        return pos;
      }

      const { width: clientWidth, height: clientHeight } = getClientArea();
      const availableHeight = clientHeight - TASKBAR_HEIGHT;

      return {
        x: Math.max(
          WINDOW_MARGIN,
          Math.min(pos.x, clientWidth - size.width - WINDOW_MARGIN),
        ),
        y: Math.max(
          WINDOW_MARGIN,
          Math.min(pos.y, availableHeight - size.height - WINDOW_MARGIN),
        ),
      };
    },
    [getClientArea],
  );

  const bringToFront = useCallback(
    (app: App) => {
      const target = windowList.find((w) => w.id === app.id);

      if (!target) {
        return;
      }

      if (target.zIndex === highestZIndex && !target.isMinimized) {
        return;
      }

      const newZIndex = highestZIndex + 1;
      setHighestZIndex(newZIndex);
      setWindowList((prev) =>
        prev.map((w) =>
          w.id === app.id ? { ...w, zIndex: newZIndex, isMinimized: false } : w,
        ),
      );
    },
    [windowList, highestZIndex],
  );

  const calculateDefaultSize = useCallback(
    (requestedSize?: WindowState['size']) => {
      const baseSize = requestedSize || {
        width: WINDOW_DEFAULT_WIDTH,
        height: WINDOW_DEFAULT_HEIGHT,
      };
      return constrainSize(baseSize);
    },
    [constrainSize],
  );

  const calculateDefaultPosition = useCallback(
    (
      requestedPosition: WindowState['position'] | undefined,
      safeSize: { width: number; height: number },
    ) => {
      const basePosition = requestedPosition || {
        x: INITIAL_POSITION_OFFSET + windowList.length * CASCADE_OFFSET,
        y: INITIAL_POSITION_OFFSET + windowList.length * CASCADE_OFFSET,
      };
      return constrainPosition(basePosition, safeSize);
    },
    [constrainPosition, windowList.length],
  );

  const openWindow = useCallback(
    (
      app: App,
      requestedSize?: WindowState['size'],
      requestedPosition?: WindowState['position'],
    ) => {
      const isPreviouslyOpened = windowList.some((w) => w.id === app.id);

      if (isPreviouslyOpened) {
        bringToFront(app);
        return;
      }

      const content = getContent(app.id);
      const newZIndex = highestZIndex + 1;
      setHighestZIndex(newZIndex);

      const safeSize = calculateDefaultSize(requestedSize);
      const safePosition = calculateDefaultPosition(
        requestedPosition,
        safeSize,
      );

      setWindowList((prev) => [
        ...prev,
        {
          ...app,
          content,
          position: safePosition,
          size: safeSize,
          zIndex: newZIndex,
          isMinimized: false,
          isMaximized: isMobile,
          previousPosition: safePosition,
          previousSize: safeSize,
        },
      ]);
    },
    [
      bringToFront,
      highestZIndex,
      windowList,
      calculateDefaultSize,
      calculateDefaultPosition,
      isMobile,
    ],
  );

  const closeWindow = useCallback((app: App) => {
    setWindowList((prev) => prev.filter((w) => w.id !== app.id));
  }, []);

  const minimizeWindow = useCallback((app: App) => {
    setWindowList((prev) =>
      prev.map((w) => (w.id === app.id ? { ...w, isMinimized: true } : w)),
    );
  }, []);

  const createMaximizedState = useCallback(
    (currentWindow: WindowState): WindowState => {
      const { width: clientWidth, height: clientHeight } = getClientArea();
      return {
        ...currentWindow,
        isMaximized: true,
        previousPosition: { ...currentWindow.position },
        previousSize: { ...currentWindow.size },
        position: { x: 0, y: 0 },
        size: {
          width: clientWidth,
          height: clientHeight - TASKBAR_HEIGHT,
        },
      };
    },
    [getClientArea],
  );

  const createRestoredState = useCallback(
    (currentWindow: WindowState): WindowState => {
      return {
        ...currentWindow,
        isMaximized: false,
        position: currentWindow.previousPosition || currentWindow.position,
        size: currentWindow.previousSize || currentWindow.size,
      };
    },
    [],
  );

  const toggleMaximizeWindow = useCallback(
    (app: App) => {
      if (app.canMaximize === false) {
        return;
      }

      setWindowList((prev) =>
        prev.map((w) => {
          if (w.id !== app.id) {
            return w;
          }

          return w.isMaximized
            ? createRestoredState(w)
            : createMaximizedState(w);
        }),
      );
    },
    [createRestoredState, createMaximizedState],
  );

  return {
    windowList,
    setWindowList,
    highestZIndex,
    setHighestZIndex,
    openWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    bringToFront,
    isMobile,
  };
};
