import { useState, useCallback } from 'react';

export function usePostSelection() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selectPost = useCallback((slug: string) => {
    setSelectedSlug(slug);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSlug(null);
  }, []);

  return { selectedSlug, selectPost, clearSelection };
}
