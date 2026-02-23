'use client';

import { useEffect, useState } from 'react';

const HEADING_SELECTOR = 'div.prose h2, div.prose h3';
const HEADING_TAG_PREFIX = 'H';
const H3_LEVEL = 3;

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TOC() {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const headingElements = Array.from(
      document.querySelectorAll(HEADING_SELECTOR),
    ) as HTMLElement[];

    const headingsData = headingElements.map((el) => ({
      id: el.id,
      text: el.innerText,
      level: Number(el.tagName.replace(HEADING_TAG_PREFIX, '')),
    }));

    // eslint-disable-next-line react-hooks/set-state-in-effect -- One-time DOM read for heading extraction
    setHeadings(headingsData);
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className='mb-8 border-2 border-white border-r-[var(--color-border-dark)] border-b-[var(--color-border-dark)] bg-[var(--color-window-bg)] p-1'>
      <div className='bg-[var(--color-window-title-active)] text-white px-2 py-1 font-bold text-sm mb-2 flex items-center justify-between'>
        <span>Table of Contents</span>
        <div className='w-4 h-4 bg-[var(--color-window-bg)] border border-white border-r-[var(--color-border-dark)] border-b-[var(--color-border-dark)] flex items-center justify-center text-black text-[10px] leading-none'>
          x
        </div>
      </div>

      <div className='bg-white border-2 border-[var(--color-border-dark)] border-r-white border-b-white p-2'>
        <ul className='list-none'>
          {headings.map((heading) => (
            <li key={heading.id} className='mb-1'>
              <a
                href={`#${heading.id}`}
                className={`
                    block text-sm text-black hover:bg-[var(--color-window-title-active)] hover:text-white hover:border-dotted hover:border-white px-1
                    ${heading.level === H3_LEVEL ? 'ml-4' : ''}
                `}
              >
                <span className='inline-block w-1.5 h-1.5 bg-black mr-2 align-middle group-hover:bg-white mb-0.5'></span>
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
