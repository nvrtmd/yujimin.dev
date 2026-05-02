import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import { trackVisit } from './trackVisit';

export function useTrackVisit(): void {
  const pathname = usePathname();

  useEffect(() => {
    trackVisit(pathname);
  }, [pathname]);
}
