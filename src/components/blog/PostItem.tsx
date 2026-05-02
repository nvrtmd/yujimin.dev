import type { Post } from '@/models';
import Image from 'next/image';
import { useSelectedStyle } from '@/hooks/useSelectedStyle';
import { formatPostDate } from '@/libs';
import { FileIcon } from '@/components/icons/blog/FileIcon';
import { POST_LIST_CONFIG } from './postListConfig';

interface PostItemProps {
  post: Post;
  viewMode: 'list' | 'gallery';
  isSelected: boolean;
  onItemClick: (e: React.MouseEvent, slug: string) => void;
  onItemDoubleClick: (e: React.MouseEvent, slug: string) => void;
}

export function PostItem({
  post,
  viewMode,
  isSelected,
  onItemClick,
  onItemDoubleClick,
}: PostItemProps) {
  const selectedStyle = useSelectedStyle(isSelected);

  if (viewMode === 'list') {
    return (
      <div
        data-testid={`post-item-${post.slug}`}
        onClick={(e) => onItemClick(e, post.slug)}
        onDoubleClick={(e) => onItemDoubleClick(e, post.slug)}
        className={`group flex items-center text-sm cursor-default select-none py-2 min-w-[700px] border ${selectedStyle.container}`}
      >
        <div className='flex-[2] min-w-[150px] border-l border-r border-transparent px-2 truncate flex items-center gap-2'>
          <div className='shrink-0 flex items-center justify-center'>
            <FileIcon className={selectedStyle.iconFill} />
          </div>
          <span className='truncate font-medium'>{post.title}</span>
        </div>
        <div
          className={`flex-[3] min-w-[200px] border-l border-r border-transparent px-2 truncate flex items-center ${selectedStyle.textSecondary}`}
        >
          {post.summary}
        </div>
        <div className='w-32 shrink-0 text-xs border-l border-r border-transparent px-2 truncate flex items-center'>
          {formatPostDate(post.date)}
        </div>
        <div className='w-24 shrink-0 text-xs border-l border-r border-transparent px-2 truncate flex items-center'>
          {post.category}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid={`post-item-${post.slug}`}
      onClick={(e) => onItemClick(e, post.slug)}
      onDoubleClick={(e) => onItemDoubleClick(e, post.slug)}
      className='group flex flex-col cursor-default select-none p-2 rounded-sm w-full max-w-[180px] mx-auto'
    >
      <div className='w-3/4 mx-auto'>
        <div className={selectedStyle.thumbnailWrapper}>
          {isSelected && (
            <div
              data-testid='thumbnail-selection-overlay'
              className='absolute inset-0 z-10 bg-[var(--color-selection-overlay)]'
              style={{
                maskImage: `url(${post.thumbnail || POST_LIST_CONFIG.DEFAULT_THUMBNAIL_PATH})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: `url(${post.thumbnail || POST_LIST_CONFIG.DEFAULT_THUMBNAIL_PATH})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
              }}
            />
          )}
          <Image
            src={post.thumbnail || POST_LIST_CONFIG.DEFAULT_THUMBNAIL_PATH}
            alt={post.title}
            fill
            className='object-contain'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        </div>
      </div>
      <div className='flex flex-col items-center text-center'>
        <h3
          className={`text-base font-bold line-clamp-2 w-auto inline-block px-1 border ${selectedStyle.container}`}
        >
          {post.title}
        </h3>
      </div>
    </div>
  );
}
