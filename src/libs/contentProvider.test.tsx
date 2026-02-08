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
    it('유효한 id로 해당 컴포넌트를 반환해야 함', () => {
      const content = getContent('about');

      expect(content).not.toBeNull();
      expect(isValidElement(content)).toBe(true);

      if (isValidElement(content)) {
        expect(content.type).toBe(AboutApp);
      }
    });

    it('미구현 id로 null을 반환해야 함', () => {
      const content = getContent('etc');
      expect(content).toBeNull();
    });
  });

  describe('Data Integrity', () => {
    it('SSG_APP_LIST와 CSR_APP_LIST는 중복이 없어야 함', () => {
      const ssgIds = SSG_APP_LIST.map((app) => app.id);
      const csrIds = CSR_APP_LIST.map((app) => app.id);

      const intersection = ssgIds.filter((id) => csrIds.includes(id));
      expect(intersection).toHaveLength(0);
    });

    it('모든 앱 ID는 고유해야 함', () => {
      const ids = APP_LIST.map((app) => app.id);
      const uniqueIds = new Set(ids);

      expect(ids).toHaveLength(uniqueIds.size);
    });
  });
});
