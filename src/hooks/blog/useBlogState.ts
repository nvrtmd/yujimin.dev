import { useCallback, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  DEFAULT_CATEGORY,
  BLOG_ROOT_NODE,
} from '@/components/blog/blogAppConfig';
import type { SortConfig, SortKey } from '@/components/blog/blogAppConfig';

export function useBlogState(isMobile: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentViewMode = (
    searchParams.get('view') === 'list' ? 'list' : 'gallery'
  ) as 'list' | 'gallery';

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [BLOG_ROOT_NODE]: true,
  });
  const [showSidebar, setShowSidebar] = useState<boolean | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'date',
    direction: 'desc',
  });

  const selectedCategoryValue = (
    searchParams.get('category') || DEFAULT_CATEGORY
  ).toLowerCase();

  const toggleNode = useCallback((nodeKey: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeKey]: !prev[nodeKey] }));
  }, []);

  const handleViewModeChange = useCallback(
    (mode: 'list' | 'gallery') => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('view', mode);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const handleCategorySelect = useCallback(
    (categoryValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (categoryValue !== DEFAULT_CATEGORY) {
        params.set('category', categoryValue);
      } else {
        params.delete('category');
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const handleHeaderClick = useCallback((key: SortKey) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setShowSidebar((prev) => {
      if (prev === null) {
        return isMobile;
      }
      return !prev;
    });
  }, [isMobile]);

  const isSidebarVisible = showSidebar === null ? !isMobile : showSidebar;
  const sidebarClass =
    showSidebar === null ? 'hidden sm:flex' : showSidebar ? 'flex' : 'hidden';

  return {
    currentViewMode,
    expandedNodes,
    showSidebar,
    setShowSidebar,
    sortConfig,
    selectedCategoryValue,
    toggleNode,
    handleViewModeChange,
    handleCategorySelect,
    handleHeaderClick,
    handleToggleSidebar,
    isSidebarVisible,
    sidebarClass,
  };
}
