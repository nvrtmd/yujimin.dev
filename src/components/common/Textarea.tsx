import React, { forwardRef, memo } from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode | string;
  error?: string;
}

const TextareaBase = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, name, ...props }, ref) => {
    const textareaId = id ?? (typeof name === 'string' ? name : undefined);
    const describedBy = error ? `${textareaId}-error` : undefined;

    return (
      <div className='flex flex-col'>
        {label && (
          <label htmlFor={textareaId} className='mb-1 text-sm'>
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={[
            'w-full h-full p-1 outline-none resize-none text-md',
            'border bg-[var(--color-white)] shadow-inset-deep cursor-retro',
            error ? 'border-red-500 bg-red-100' : 'border-black',
            className ?? '',
          ].join(' ')}
          {...props}
        />

        {error && (
          <p id={describedBy} className='text-red-600 text-xs mt-1'>
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextareaBase.displayName = 'Textarea';
export const Textarea = memo(TextareaBase);
