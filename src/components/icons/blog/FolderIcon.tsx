interface FolderIconProps {
  variant?: 'tree' | 'toggle';
  isOpen?: boolean;
  className?: string;
}

export const FolderIcon = ({
  variant = 'tree',
  isOpen = false,
  className,
}: FolderIconProps) => {
  const baseClassName =
    variant === 'toggle'
      ? 'w-3 h-3'
      : `w-4 h-4 mr-1 inline-block shrink-0 ${isOpen ? 'text-[var(--color-folder-open)]' : 'text-[var(--color-folder-closed)]'} drop-shadow-[1px_1px_0_rgba(0,0,0,0.2)]`;

  return (
    <svg
      className={`${baseClassName} ${className || ''}`}
      fill='currentColor'
      viewBox='0 0 24 24'
    >
      <path d='M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z' />
    </svg>
  );
};
