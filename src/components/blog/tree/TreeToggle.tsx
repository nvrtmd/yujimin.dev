interface TreeToggleProps {
  isOpen: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const TreeToggle = ({ isOpen, onClick }: TreeToggleProps) => (
  <div
    onClick={onClick}
    className='w-[9px] h-[9px] border border-[var(--color-border-dark)] bg-white flex items-center justify-center cursor-default mr-1 relative z-10 shrink-0'
  >
    <span className='absolute top-[-2px] left-[1px] text-black text-[8px] font-bold leading-none'>
      {isOpen ? '-' : '+'}
    </span>
  </div>
);
