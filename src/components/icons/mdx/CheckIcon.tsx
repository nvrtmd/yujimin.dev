interface CheckIconProps {
  readonly className?: string;
}

export function CheckIcon({ className = '' }: CheckIconProps) {
  return (
    <svg
      data-testid='check-icon'
      className={className}
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <polyline points='20 6 9 17 4 12' />
    </svg>
  );
}
