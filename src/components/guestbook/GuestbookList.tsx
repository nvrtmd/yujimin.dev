'use client';

import { useTranslations } from 'next-intl';
import type { GuestbookEntry } from '@/models';
import { GuestbookItem } from './GuestbookItem';
import useInfiniteScroll from 'react-infinite-scroll-hook';

interface GuestbookListProps {
  entries: GuestbookEntry[];
  fetchEntries: () => void;
  isLoading: boolean;
  hasNextPage: boolean;
}

const INFINITE_SCROLL_ROOT_MARGIN = '0px 0px 200px 0px';

export function GuestbookList({
  entries,
  fetchEntries,
  isLoading,
  hasNextPage,
}: GuestbookListProps) {
  const t = useTranslations('guestbook.list');
  const [scrollRef] = useInfiniteScroll({
    loading: isLoading,
    hasNextPage,
    onLoadMore: fetchEntries,
    rootMargin: INFINITE_SCROLL_ROOT_MARGIN,
  });

  const showLoadingIndicator = isLoading || hasNextPage;
  const showEndMessage = !hasNextPage && entries.length > 0;
  const showEmptyState = entries.length === 0 && !isLoading;

  return (
    <div className='relative bg-white h-full'>
      <div className='grid gap-1'>
        {entries.map((entry) => (
          <GuestbookItem key={entry.id} entry={entry} />
        ))}
      </div>

      {showLoadingIndicator && (
        <div ref={scrollRef} className='text-center p-4'>
          {t('loading')}
        </div>
      )}

      {showEndMessage && (
        <p className='text-center text-gray-500 text-sm p-4 border-t mt-4'>
          {t('endOfMessages')}
        </p>
      )}

      {showEmptyState && (
        <p className='text-center text-gray-500 text-sm p-8'>
          {t('empty')}
        </p>
      )}
    </div>
  );
}
