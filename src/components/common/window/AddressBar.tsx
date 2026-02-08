'use client';

import { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/Button';

interface AddressBarProps {
  isPreviousPathHome: boolean;
}

export const AddressBar = memo(({ isPreviousPathHome }: AddressBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentUrl, setCurrentUrl] = useState(() => {
    const params = searchParams.toString();
    return params ? `${pathname}?${params}` : pathname;
  });

  useEffect(() => {
    const origin = window.location.origin;
    const params = searchParams.toString();
    const path = params ? `${pathname}?${params}` : pathname;
    setCurrentUrl(`${origin}${path}`);
  }, [pathname, searchParams]);

  return (
    <div className='border border-[var(--color-border-medium)] font-sans text-base p-1 flex items-center mb-1 shrink-0 bg-[var(--color-window-bg)]'>
      <div className='flex shrink-0'>
        <Button
          onClick={() => router.back()}
          type='button'
          className='p-1'
          disabled={isPreviousPathHome}
        >
          <Image
            src='/images/icons/left_pointer.png'
            alt='back'
            width={28}
            height={28}
          />
        </Button>
        <Button onClick={() => router.forward()} type='button' className='p-1'>
          <Image
            src='/images/icons/right_pointer.png'
            alt='forward'
            width={28}
            height={28}
          />
        </Button>
      </div>
      <div className='bg-white shadow-inset-deep border-none p-1 flex items-center w-full min-w-0 ml-1'>
        <Image
          src='/images/icons/window_page_img.png'
          alt='window page icon'
          width={16}
          height={16}
          className='inline-block mr-1 shrink-0'
        />
        <div className='w-full whitespace-nowrap overflow-hidden text-ellipsis text-xs sm:text-sm'>
          {currentUrl}
        </div>
      </div>
    </div>
  );
});
AddressBar.displayName = 'AddressBar';
