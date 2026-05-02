'use client';

import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { Post } from '@/models';
import type { SortConfig } from './BlogApp';
import { PostItem } from './PostItem';
import { usePostSelection } from '@/hooks/blog/usePostSelection';
import { POST_LIST_CONFIG } from './postListConfig';

interface PostListProps {
  posts: Post[];
  viewMode: 'list' | 'gallery';
  sortConfig: SortConfig;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

// Derive a stable key from sort/view config to reset displayedCount
function getSortViewKey(sortConfig: SortConfig, viewMode: string): string {
  return `${sortConfig.key}-${sortConfig.direction}-${viewMode}`;
}

export function PostList({
  posts,
  viewMode,
  sortConfig,
  scrollContainerRef,
}: PostListProps) {
  const t = useTranslations('blog');
  const router = useRouter();
  const { selectedSlug, selectPost, clearSelection } = usePostSelection();
  const triggerRef = useRef<HTMLDivElement>(null);

  // Reset displayedCount when sortConfig or viewMode changes
  const sortViewKey = getSortViewKey(sortConfig, viewMode);
  const [prevSortViewKey, setPrevSortViewKey] = useState(sortViewKey);
  const [displayedCount, setDisplayedCount] = useState<number>(
    POST_LIST_CONFIG.POSTS_PER_LOAD,
  );

  if (prevSortViewKey !== sortViewKey) {
    setPrevSortViewKey(sortViewKey);
    setDisplayedCount(POST_LIST_CONFIG.POSTS_PER_LOAD);
  }

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const { key, direction } = sortConfig;
      let comparison = 0;
      if (key === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        const valA = (a[key] || '').toString();
        const valB = (b[key] || '').toString();
        comparison = valA.localeCompare(valB, navigator.language);
      }
      return direction === 'asc' ? comparison : -comparison;
    });
  }, [posts, sortConfig]);

  const currentPosts = useMemo(() => {
    return sortedPosts.slice(0, displayedCount);
  }, [sortedPosts, displayedCount]);

  useEffect(() => {
    const triggerElement = triggerRef.current;
    if (!triggerElement) return;
    if (displayedCount >= sortedPosts.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedCount((prev) =>
            Math.min(
              prev + POST_LIST_CONFIG.POSTS_PER_LOAD,
              sortedPosts.length,
            ),
          );
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: POST_LIST_CONFIG.INTERSECTION_ROOT_MARGIN,
        threshold: 0,
      },
    );
    observer.observe(triggerElement);
    return () => observer.disconnect();
  }, [displayedCount, scrollContainerRef, sortedPosts.length]);

  const handleItemClick = useCallback(
    (e: React.MouseEvent, slug: string) => {
      e.preventDefault();
      e.stopPropagation();
      selectPost(slug);
    },
    [selectPost],
  );

  const handleItemDoubleClick = useCallback(
    (e: React.MouseEvent, slug: string) => {
      e.preventDefault();
      router.push(`/blog/${slug}`);
    },
    [router],
  );

  return (
    <div className='flex flex-col min-h-full bg-white' onClick={clearSelection}>
      <div className='flex-1'>
        {currentPosts.length > 0 ? (
          <div
            data-testid='post-list'
            className={
              viewMode === 'list'
                ? 'flex flex-col py-1'
                : 'grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6 p-4 content-start'
            }
          >
            {currentPosts.map((post) => (
              <PostItem
                key={post.slug}
                post={post}
                viewMode={viewMode}
                isSelected={selectedSlug === post.slug}
                onItemClick={handleItemClick}
                onItemDoubleClick={handleItemDoubleClick}
              />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-64 text-gray-500'>
            <p>{t('empty')}</p>
          </div>
        )}
      </div>
      {displayedCount < sortedPosts.length && (
        <div
          ref={triggerRef}
          data-testid='post-loading-trigger'
          className='h-8 w-full flex items-center justify-center text-gray-400 text-xs'
        >
          <span>{t('loadingMore')}</span>
        </div>
      )}
    </div>
  );
}
