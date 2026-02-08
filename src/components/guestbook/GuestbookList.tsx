'use client';

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
const TEXT_LOADING = '-- Loading... --';
const TEXT_END_OF_MESSAGES = '-- End of messages --';
const TEXT_EMPTY_STATE = 'Be the first to leave a message!';

export function GuestbookList({
  entries,
  fetchEntries,
  isLoading,
  hasNextPage,
}: GuestbookListProps) {
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
          {TEXT_LOADING}
        </div>
      )}

      {showEndMessage && (
        <p className='text-center text-gray-500 text-sm p-4 border-t mt-4'>
          {TEXT_END_OF_MESSAGES}
        </p>
      )}

      {showEmptyState && (
        <p className='text-center text-gray-500 text-sm p-8'>
          {TEXT_EMPTY_STATE}
        </p>
      )}
    </div>
  );
}
