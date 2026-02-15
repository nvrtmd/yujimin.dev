import { describe, it, expect } from 'vitest';
import { isValidElement } from 'react';
import { APP_LIST, getContent } from './contentProvider';
import { AboutApp } from '@/components/about';

describe('contentProvider', () => {
  describe('getContent', () => {
    it('[valid] should return the corresponding component for valid id', () => {
      const content = getContent('about-me');

      expect(content).not.toBeNull();
      expect(isValidElement(content)).toBe(true);

      if (isValidElement(content)) {
        expect(content.type).toBe(AboutApp);
      }
    });

    it('[invalid] should return null for unimplemented id', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content = getContent('etc' as any);
      expect(content).toBeNull();
    });
  });

  describe('Data Integrity', () => {
    it('[integrity] should have unique IDs for all apps', () => {
      const ids = APP_LIST.map((app) => app.id);
      const uniqueIds = new Set(ids);

      expect(ids).toHaveLength(uniqueIds.size);
    });
  });
});
