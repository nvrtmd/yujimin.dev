import { ReactNode } from 'react';
import { useSelectedStyle } from '@/hooks/useSelectedStyle';
import { TreeToggle } from './TreeToggle';

interface TreeItemProps {
  label: string;
  icon: ReactNode;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggle?: (e: React.MouseEvent) => void;
  isLastChild?: boolean;
  level?: number;
}

export const TreeItem = ({
  label,
  icon,
  isSelected,
  onClick,
  hasChildren,
  isExpanded,
  onToggle,
  isLastChild,
  level = 0,
}: TreeItemProps) => {
  const selectedStyle = useSelectedStyle(isSelected);
  return (
    <div
      className={`flex items-center mb-0.5 px-1 cursor-pointer select-none border ${selectedStyle.container} relative`}
      onClick={onClick}
    >
      {level > 0 && (
        <>
          <span
            className={`absolute left-[-16px] top-0 w-[1px] border-l border-dotted border-gray-400 ${isLastChild ? 'h-1/2' : 'h-full'}`}
          ></span>
          <span className='w-4 border-t border-dotted border-gray-400 absolute left-[-16px] top-1/2'></span>
        </>
      )}
      {hasChildren && onToggle && (
        <TreeToggle isOpen={isExpanded || false} onClick={onToggle} />
      )}
      {icon}
      <span className='text-base font-bold ml-1 truncate'>{label}</span>
    </div>
  );
};
