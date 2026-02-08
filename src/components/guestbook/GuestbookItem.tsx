'use client';

import type { GuestbookEntry } from '@/models';
import Image from 'next/image';
import { getTimeAgo } from '@/libs';

interface GuestbookItemProps {
  entry: GuestbookEntry;
}

const ICON_USER = '/images/icons/user.png';
const ICON_LOCATION = '/images/icons/location.png';
const ICON_EXTERNAL_LINK = '/images/icons/external_link.png';
const ICON_SIZE = 10;

function normalizeUrl(url: string): string {
  return url.startsWith('http') ? url : `https://${url}`;
}

export function GuestbookItem({ entry }: GuestbookItemProps) {
  const timeAgo = getTimeAgo(entry.createdAt);

  return (
    <div
      data-testid='guestbook-item'
      className='btn-outset p-2 bg-white min-w-0 flex flex-col gap-2'
    >
      <div className='flex justify-between items-center text-sm min-w-0'>
        <div className='flex items-center gap-1 min-w-0 font-bold break-words'>
          <Image
            src={ICON_USER}
            alt='user'
            width={ICON_SIZE}
            height={ICON_SIZE}
            className='flex-shrink-0'
          />
          <p data-testid='guestbook-item-nickname'>{entry.nickname}</p>
        </div>
        <span className='text-gray-500'>{timeAgo}</span>
      </div>

      <p className='text-base break-words'>{entry.message}</p>

      <div className='flex flex-wrap items-center gap-2 text-xs text-gray-600 min-w-0'>
        {entry.location && (
          <div className='flex items-center gap-1 min-w-0'>
            <Image
              src={ICON_LOCATION}
              alt='location'
              width={ICON_SIZE}
              height={ICON_SIZE}
              className='flex-shrink-0'
            />
            <span className='break-words'>{entry.location}</span>
          </div>
        )}

        {entry.website && (
          <div className='flex items-center gap-1 min-w-0 ml-auto'>
            <Image
              src={ICON_EXTERNAL_LINK}
              alt='link'
              width={ICON_SIZE}
              height={ICON_SIZE}
              className='flex-shrink-0'
            />
            <a
              href={normalizeUrl(entry.website)}
              target='_blank'
              rel='noopener noreferrer'
              className='underline whitespace-nowrap overflow-hidden text-ellipsis'
              title={entry.website}
            >
              {entry.website}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
