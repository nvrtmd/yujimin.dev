'use client';

import { useRef, useState, HTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';
import { CopyIcon, CheckIcon } from '@/components/icons/mdx';

const COPY_FEEDBACK_DURATION_MS = 1500;
const ERROR_COPY_FAILED = 'Failed to copy text: ';

type CodeBlockProps = HTMLAttributes<HTMLPreElement>;

export function CodeBlock({ children, ...props }: CodeBlockProps) {
  const tCommon = useTranslations('common');
  const tMdx = useTranslations('mdx');
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const codeElement = preRef.current?.querySelector('code');
    const codeText = codeElement?.textContent || '';

    if (!codeText) return;

    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
    } catch (err) {
      console.error(ERROR_COPY_FAILED, err);
    }
  };

  return (
    <div className='relative my-6 font-mono text-sm group code-block-wrapper not-prose'>
      <div className='bg-[var(--color-window-bg)] border-t-2 border-l-2 border-white border-r-2 border-r-[var(--color-border-dark)] border-b-2 border-b-[var(--color-border-dark)] px-2 py-1 flex justify-between items-center'>
        <span className='text-xs text-black'>{tMdx('sourceCode')}</span>

        <button
          onClick={handleCopy}
          aria-label={copied ? tCommon('copied') : tMdx('copyCode')}
          className={`
                px-2 py-[1px] text-xs font-sans text-black bg-[var(--color-window-bg)]
                border-t border-l border-white border-b border-r border-[var(--color-button-dark)] shadow-[1px_1px_0_black]
                active:border-t-[var(--color-button-dark)] active:border-l-[var(--color-button-dark)] active:border-b-white active:border-r-white active:shadow-none active:translate-x-[1px] active:translate-y-[1px]
                flex items-center gap-1 min-w-[60px]
            `}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? tCommon('copied') : tCommon('copy')}</span>
        </button>
      </div>
      <pre
        ref={preRef}
        {...props}
        className='!bg-[#1e1e1e] !text-[#d4d4d4] p-4 !border-2 !border-[var(--color-border-dark)] !border-t-[var(--color-border-dark)] !border-l-[var(--color-border-dark)] !border-r-white !border-b-white overflow-x-auto !m-0 !rounded-none'
      >
        {children}
      </pre>
    </div>
  );
}
