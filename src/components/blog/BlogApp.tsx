'use client';

import { PostList } from './PostList';
import type { Post } from '@/models';
import { useMemo, useRef } from 'react';
import { PushLockButton } from '../common/PushLockButton';
import { useMobile } from '@/hooks/useMobile';
import { useBlogState } from '@/hooks/blog/useBlogState';
import { FolderIcon, ListViewIcon, GalleryViewIcon } from '../icons/blog';
import Image from 'next/image';
import { TreeItem } from './tree';
import {
  DEFAULT_CATEGORY,
  BLOG_ROOT_NODE,
  SORT_HEADER_BASE_CLASS,
  SORT_HEADERS,
} from './blogAppConfig';
export type { SortConfig, SortKey, SortDirection } from './blogAppConfig';

interface BlogAppProps {
  posts: Post[];
  initialCategories: string[];
}

export function BlogApp({ posts, initialCategories }: BlogAppProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();

  const {
    currentViewMode,
    expandedNodes,
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
  } = useBlogState(isMobile);

  const postCounts = useMemo(
    () =>
      posts.reduce(
        (acc, post) => ({
          ...acc,
          [post.category]: (acc[post.category] || 0) + 1,
        }),
        {} as Record<string, number>,
      ),
    [posts],
  );

  const categoriesWithCounts = useMemo(
    () => [
      ...initialCategories.map((category) => ({
        name: category,
        value: category.toLowerCase(),
        count: postCounts[category] || 0,
      })),
    ],
    [initialCategories, postCounts],
  );

  const filteredPosts = useMemo(() => {
    if (selectedCategoryValue === DEFAULT_CATEGORY) {
      return posts;
    }
    return posts.filter(
      (post) => post.category.toLowerCase() === selectedCategoryValue,
    );
  }, [posts, selectedCategoryValue]);

  return (
    <div className='flex flex-col h-full bg-[var(--color-window-bg)] font-sans text-sm shadow-md'>
      <div className='py-0.5 px-1 border-b border-white'>
        <div className='flex items-center gap-1 justify-between'>
          <PushLockButton
            isPushed={isSidebarVisible}
            onClick={handleToggleSidebar}
            title='Toggle Sidebar'
            aria-label='Toggle Sidebar'
            aria-expanded={isSidebarVisible}
            aria-controls='blog-sidebar'
          >
            <FolderIcon variant='toggle' />
            <span className='text-xs'>Categories</span>
          </PushLockButton>
          <div className='flex items-center gap-1'>
            <PushLockButton
              data-testid='view-list-button'
              isPushed={currentViewMode === 'list'}
              onClick={() => handleViewModeChange('list')}
            >
              <ListViewIcon />
            </PushLockButton>
            <PushLockButton
              data-testid='view-gallery-button'
              isPushed={currentViewMode === 'gallery'}
              onClick={() => handleViewModeChange('gallery')}
            >
              <GalleryViewIcon />
            </PushLockButton>
          </div>
        </div>
      </div>

      <div className='flex flex-1 overflow-hidden px-1 pb-1 gap-1'>
        <div
          id='blog-sidebar'
          data-testid='blog-sidebar'
          aria-hidden={!isSidebarVisible}
          className={`${sidebarClass} flex-col w-50 flex-shrink-0 transition-all`}
        >
          <div className='flex-1 bg-white border-2 border-[var(--color-border-dark)] border-r-white border-b-white overflow-y-scroll overflow-x-auto p-2 shadow-blog-panel'>
            <div className='min-w-full inline-block align-top'>
              <TreeItem
                label='Blog'
                icon={
                  <Image
                    src='/images/icons/folder_img.webp'
                    alt='folder'
                    width={16}
                    height={16}
                    className='mr-1 inline-block shrink-0 w-3 h-3'
                  />
                }
                isSelected={selectedCategoryValue === DEFAULT_CATEGORY}
                onClick={() => handleCategorySelect(DEFAULT_CATEGORY)}
                hasChildren={true}
                isExpanded={expandedNodes[BLOG_ROOT_NODE]}
                onToggle={(e) => {
                  e.stopPropagation();
                  toggleNode(BLOG_ROOT_NODE);
                }}
                level={0}
              />
              {expandedNodes[BLOG_ROOT_NODE] && (
                <div className='ml-5 pl-4 py-1'>
                  {categoriesWithCounts.map((category, index) => (
                    <TreeItem
                      key={category.value}
                      label={`${category.name} (${category.count})`}
                      icon={
                        <Image
                          src='/images/icons/folder_img.webp'
                          alt='folder'
                          width={16}
                          height={16}
                          className='mr-1 inline-block shrink-0 w-3 h-3'
                        />
                      }
                      isSelected={selectedCategoryValue === category.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategorySelect(category.value);
                        if (isMobile) setShowSidebar(false);
                      }}
                      isLastChild={index === categoriesWithCounts.length - 1}
                      level={1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='flex flex-col flex-grow h-full min-w-0'>
          <div
            ref={scrollContainerRef}
            data-testid='scroll-container'
            className='flex-1 bg-white border-2 border-[var(--color-border-dark)] border-r-white border-b-white overflow-y-auto overflow-x-auto relative flex flex-col shadow-blog-panel'
          >
            {currentViewMode === 'list' && (
              <div className='sticky top-0 bg-[var(--color-window-bg)] flex text-xs z-10 box-border border-b border-[var(--color-border-dark)] min-w-[700px]'>
                {SORT_HEADERS.map(({ key, label, sizeClass }) => (
                  <div
                    key={key}
                    data-testid={`sort-${key}`}
                    className={`${sizeClass} ${SORT_HEADER_BASE_CLASS}`}
                    onClick={() => handleHeaderClick(key)}
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
            <div className='flex-1 p-0 bg-white'>
              <PostList
                posts={filteredPosts}
                viewMode={currentViewMode}
                sortConfig={sortConfig}
                scrollContainerRef={scrollContainerRef}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='flex justify-between items-center px-2 py-0.5 border-t border-[var(--color-border-dark)] bg-[var(--color-window-bg)] text-xs text-black select-none shadow-blog-status'>
        <div className='flex gap-4'>
          <span>{filteredPosts.length} object(s)</span>
        </div>
        <div className='flex gap-2'>
          <span className='border border-[var(--color-border-dark)] border-b-white border-r-white px-2 bg-[var(--color-window-bg)]'>
            Blog
          </span>
        </div>
      </div>
    </div>
  );
}
