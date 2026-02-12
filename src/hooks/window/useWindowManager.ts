'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { App, WindowState } from '@/models';
import { useWindowState } from './useWindowState';
import { useWindowDrag } from './useWindowDrag';
import { useWindowResize } from './useWindowResize';
import { useUrlNavigation } from '../useUrlNavigation';

const findFrontmostWindow = (windows: WindowState[]): WindowState | null => {
  const openWindows = windows.filter((w) => !w.isMinimized);

  if (openWindows.length === 0) {
    return null;
  }

  return openWindows.sort((a, b) => b.zIndex - a.zIndex)[0];
};

export const useWindowManager = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    windowList,
    setWindowList,
    openWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    bringToFront,
  } = useWindowState();

  const { isPreviousPathHome } = useUrlNavigation(
    windowList,
    openWindow,
    bringToFront,
  );

  const { handleWindowDragMouseDown } = useWindowDrag({
    setWindowList,
    bringToFront,
  });

  const { handleResizeMouseDown } = useWindowResize(
    setWindowList,
    bringToFront,
  );

  const frontmostOpenWindow = useMemo(
    () => findFrontmostWindow(windowList),
    [windowList],
  );

  const toggleWindowFromTaskbar = useCallback(
    (app: App) => {
      const isFrontmost = frontmostOpenWindow?.id === app.id;

      if (isFrontmost) {
        minimizeWindow(app);
      } else {
        bringToFront(app);
      }
    },
    [frontmostOpenWindow, minimizeWindow, bringToFront],
  );

  const handleOpenWindow = useCallback(
    (app: App) => {
      const existingWindow = windowList.find((w) => w.id === app.id);
      if (existingWindow) {
        bringToFront(existingWindow);
      }
      router.push(`/${app.id}`);
    },
    [router, windowList, bringToFront],
  );

  const handleCloseWindow = useCallback(
    (window: WindowState) => {
      const isActiveWindow = pathname.startsWith(`/${window.id}`);
      if (isActiveWindow) {
        router.push('/');
      }

      closeWindow(window);
    },
    [router, pathname, closeWindow],
  );

  return {
    windowList,
    frontmostOpenWindow,
    isPreviousPathHome,
    handleOpenWindow,
    handleCloseWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    bringToFront,
    toggleWindowFromTaskbar,
    handleWindowDragMouseDown,
    handleResizeMouseDown,
  };
};
