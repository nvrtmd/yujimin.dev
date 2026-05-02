'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const CLOCK_UPDATE_INTERVAL_MS = 1000;
const CLOCK_ICON = '/images/icons/clock_img.webp';
const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, CLOCK_UPDATE_INTERVAL_MS);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className='flex items-center p-1 shadow-clock select-none'>
      <Image
        src={CLOCK_ICON}
        alt='scheduler icon'
        width={20}
        height={20}
        className='mx-1'
      />
      <span>{time.toLocaleTimeString('en-US', TIME_FORMAT_OPTIONS)}</span>
    </div>
  );
}
