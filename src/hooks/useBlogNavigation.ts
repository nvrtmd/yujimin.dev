'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const BLOG_PATH_PREFIX = '/blog';

export interface BlogNavigation {
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
}

export const useBlogNavigation = (): BlogNavigation => {
  const pathname = usePathname();
  const router = useRouter();

  const historyRef = useRef<string[]>([]);
  const indexRef = useRef(-1);
  const isInternalNavRef = useRef(false);

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    if (!pathname.startsWith(BLOG_PATH_PREFIX)) {
      return;
    }

    if (isInternalNavRef.current) {
      isInternalNavRef.current = false;
      return;
    }

    const newIndex = indexRef.current + 1;
    historyRef.current = [...historyRef.current.slice(0, newIndex), pathname];
    indexRef.current = newIndex;

    setCanGoBack(newIndex > 0);
    setCanGoForward(false);
  }, [pathname]);

  const goBack = useCallback(() => {
    if (indexRef.current <= 0) return;

    isInternalNavRef.current = true;
    const newIndex = indexRef.current - 1;
    indexRef.current = newIndex;

    setCanGoBack(newIndex > 0);
    setCanGoForward(true);

    router.push(historyRef.current[newIndex]);
  }, [router]);

  const goForward = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;

    isInternalNavRef.current = true;
    const newIndex = indexRef.current + 1;
    indexRef.current = newIndex;

    setCanGoBack(true);
    setCanGoForward(newIndex < historyRef.current.length - 1);

    router.push(historyRef.current[newIndex]);
  }, [router]);

  return { canGoBack, canGoForward, goBack, goForward };
};
