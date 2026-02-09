import { describe, it, expect } from 'vitest';
import { isValidElement } from 'react';
import {
  APP_LIST,
  SSG_APP_LIST,
  CSR_APP_LIST,
  getContent,
} from './contentProvider';
import { AboutApp } from '@/components/about';

describe('contentProvider', () => {
  describe('getContent', () => {
    it('[valid] should return the corresponding component for valid id', () => {
      const content = getContent('about');

      expect(content).not.toBeNull();
      expect(isValidElement(content)).toBe(true);

      if (isValidElement(content)) {
        expect(content.type).toBe(AboutApp);
      }
    });

    it('[invalid] should return null for unimplemented id', () => {
      const content = getContent('etc');
      expect(content).toBeNull();
    });
  });

  describe('Data Integrity', () => {
    it('[integrity] should have no duplicates between SSG_APP_LIST and CSR_APP_LIST', () => {
      const ssgIds = SSG_APP_LIST.map((app) => app.id);
      const csrIds = CSR_APP_LIST.map((app) => app.id);

      const intersection = ssgIds.filter((id) => csrIds.includes(id));
      expect(intersection).toHaveLength(0);
    });

    it('[integrity] should have unique IDs for all apps', () => {
      const ids = APP_LIST.map((app) => app.id);
      const uniqueIds = new Set(ids);

      expect(ids).toHaveLength(uniqueIds.size);
    });
  });
});
