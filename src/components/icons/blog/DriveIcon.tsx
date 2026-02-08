interface DriveIconProps {
  className?: string;
}

export const DriveIcon = ({ className }: DriveIconProps) => (
  <svg
    className={`w-4 h-4 mr-1 inline-block shrink-0 ${className}`}
    viewBox='0 0 24 24'
    fill='currentColor'
  >
    <path
      d='M2 6h20v12H2z'
      fill='var(--color-window-bg)'
      stroke='var(--color-border-dark)'
    />
    <path d='M4 8h2v2H4zm14 0h2v2h-2z' fill='#000' />
    <path d='M2 6h20' stroke='white' strokeWidth='2' />
  </svg>
);
