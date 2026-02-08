import { forwardRef, memo, InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode | string;
  error?: string;
}

const InputBase = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, name, ...props }, ref) => {
    const inputId = id ?? (typeof name === 'string' ? name : undefined);
    const describedBy = error ? `${inputId}-error` : undefined;

    return (
      <div className='flex flex-col'>
        {label && (
          <label htmlFor={inputId} className='mb-1 text-sm'>
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={[
            'w-full p-1 outline-none bg-[var(--color-white)] text-md',
            'border shadow-inset cursor-retro',
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
InputBase.displayName = 'Input';
export const Input = memo(InputBase);
