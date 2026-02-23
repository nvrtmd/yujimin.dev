'use client';

import { ReactNode } from 'react';

interface DetailsProps {
  summary: string;
  children: ReactNode;
}

export function Details({ summary, children }: DetailsProps) {
  return (
    <details className='group my-4 bg-[var(--color-window-bg)] border-2 border-white border-r-[var(--color-border-dark)] border-b-[var(--color-border-dark)] p-1'>
      <summary className='font-bold text-sm bg-[var(--color-window-bg)] text-black list-none flex items-center gap-2 p-1 hover:bg-[var(--color-window-title-active)] hover:text-white group-open:mb-1 select-none focus:outline-none focus:ring-1 focus:ring-black focus:ring-dotted'>
        <div className='relative w-3 h-3 bg-white border border-gray-600 flex items-center justify-center text-[10px] text-black leading-none group-hover:invert'>
          <span className='block group-open:hidden'>+</span>
          <span className='hidden group-open:block'>-</span>
        </div>
        {summary}
      </summary>

      <div className='bg-white border-2 border-[var(--color-border-dark)] border-r-white border-b-white p-3 text-sm'>
        {children}
      </div>
    </details>
  );
}
