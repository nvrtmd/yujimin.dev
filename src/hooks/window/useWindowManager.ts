'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { App, WindowState } from '@/models';
import { useWindowState } from './useWindowState';
import { useWindowDrag } from './useWindowDrag';
import { useWindowResize } from './useWindowResize';
import { useUrlNavigation } from '../useUrlNavigation';
import { useBlogNavigation } from '../useBlogNavigation';

const findFrontmostWindow = (windows: WindowState[]): WindowState | null => {
  const openWindows = windows.filter((w) => !w.isMinimized);

  if (openWindows.length === 0) {
    return null;
  }

  return openWindows.sort((a, b) => b.zIndex - a.zIndex)[0];
};

export const useWindowManager = (apps: App[]) => {
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

  useUrlNavigation(windowList, apps, openWindow, bringToFront);

  const blogNavigation = useBlogNavigation();

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

      // For apps with URL sync (currently only Blog), update URL and let useUrlNavigation handle window creation
      // For other apps, directly open window without URL change
      if (app.syncWithUrl) {
        router.push(`/${app.id}`);
      } else {
        if (!existingWindow) {
          openWindow(app, app.size, app.position);
        }
      }
    },
    [router, windowList, bringToFront, openWindow],
  );

  const handleCloseWindow = useCallback(
    (window: WindowState) => {
      // Only update URL for apps with URL sync (currently only Blog)
      if (window.syncWithUrl) {
        const isActiveWindow = pathname.startsWith(`/${window.id}`);
        if (isActiveWindow) {
          router.push('/');
        }
      }

      closeWindow(window);
    },
    [router, pathname, closeWindow],
  );

  return {
    windowList,
    frontmostOpenWindow,
    blogNavigation,
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
