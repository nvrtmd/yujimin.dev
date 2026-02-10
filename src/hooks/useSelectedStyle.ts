import { useMemo } from 'react';

export const useSelectedStyle = (isSelected: boolean) => {
  return useMemo(
    () => ({
      // Transparent border prevents layout shift on selection toggle
      container: isSelected
        ? 'bg-[var(--color-window-title-active)] text-white border-gray-200 border-dotted'
        : 'text-black border-transparent border-dotted',

      thumbnailWrapper: 'relative w-full aspect-square mb-2 bg-white',

      // hard-light blend mode tints the image with the blue selection background
      imageTint: isSelected ? 'opacity-90 mix-blend-hard-light' : '',

      iconFill: isSelected ? 'text-white' : 'text-gray-500',

      textSecondary: isSelected ? 'text-gray-200' : 'text-gray-500',
    }),
    [isSelected],
  );
};
