'use client';

import { GuestbookForm } from './GuestbookForm';
import { GuestbookList } from './GuestbookList';
import { useGuestbook } from '@/hooks/guestbook/useGuestbook';

const TEXT = {
  TITLE: 'Guestbook',
  SUBTITLE: 'Leave a message!',
} as const;

export function GuestbookApp() {
  const { entries, isLoading, hasNextPage, fetchEntries, refreshEntries } =
    useGuestbook();

  return (
    <div className='flex flex-col h-full bg-[var(--color-window-bg)] p-4 gap-4 overflow-y-auto md:overflow-hidden'>
      <header className='text-center flex-shrink-0'>
        <h2 className='text-2xl font-bold'>{TEXT.TITLE}</h2>
        <p className='text-md'>{TEXT.SUBTITLE}</p>
      </header>

      <div className='flex flex-col md:flex-row w-full gap-4 flex-grow md:min-h-0 md:overflow-hidden'>
        <div
          className='
            w-full md:w-[340px] flex-shrink-0
            pr-0 md:pr-4
            pb-4 md:pb-0
            border-b-2 md:border-b-0 md:border-r-2 border-white/50
          '
        >
          <GuestbookForm refreshEntries={refreshEntries} />
        </div>

        <div
          className='
            flex-grow flex-shrink
            min-h-[200px] md:min-h-0
            overflow-visible md:overflow-y-auto
            border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white
            bg-white
          '
        >
          <GuestbookList
            entries={entries}
            fetchEntries={fetchEntries}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
          />
        </div>
      </div>
    </div>
  );
}
