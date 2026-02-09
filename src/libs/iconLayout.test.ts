import { calculateInitialIconPositions, ICON_LAYOUT } from './iconLayout';

describe('calculateInitialIconPositions', () => {
  const mockAppIds = [
    'blog',
    'about',
    'guestbook',
    'analytics',
    'resume',
    'etc',
  ];

  describe('grid calculation with 768px viewport', () => {
    it('should place 6 icons in a single column at 768px viewport height', () => {
      const positions = calculateInitialIconPositions(mockAppIds, 768);

      expect(positions).toEqual({
        blog: { x: 16, y: 16 },
        about: { x: 16, y: 122 },
        guestbook: { x: 16, y: 228 },
        analytics: { x: 16, y: 334 },
        resume: { x: 16, y: 440 },
        etc: { x: 16, y: 546 },
      });
    });

    it('should match the exact positions expected by useIconDrag tests', () => {
      const positions = calculateInitialIconPositions(mockAppIds, 768);

      expect(positions.blog).toEqual({ x: 16, y: 16 });
      expect(positions.about).toEqual({ x: 16, y: 122 });
      expect(positions.guestbook).toEqual({ x: 16, y: 228 });
      expect(positions.analytics).toEqual({ x: 16, y: 334 });
      expect(positions.resume).toEqual({ x: 16, y: 440 });
      expect(positions.etc).toEqual({ x: 16, y: 546 });
    });
  });

  describe('grid calculation with 1080px viewport', () => {
    it('should place all 6 icons in a single column at 1080px viewport height', () => {
      const positions = calculateInitialIconPositions(mockAppIds, 1080);

      expect(positions.blog).toEqual({ x: 16, y: 16 });
      expect(positions.about).toEqual({ x: 16, y: 122 });
      expect(positions.guestbook).toEqual({ x: 16, y: 228 });
      expect(positions.analytics).toEqual({ x: 16, y: 334 });
      expect(positions.resume).toEqual({ x: 16, y: 440 });
      expect(positions.etc).toEqual({ x: 16, y: 546 });
    });
  });

  describe('grid calculation with 1440px viewport', () => {
    it('should place all 6 icons in a single column at 1440px viewport height', () => {
      const positions = calculateInitialIconPositions(mockAppIds, 1440);

      expect(positions.blog).toEqual({ x: 16, y: 16 });
      expect(positions.etc).toEqual({ x: 16, y: 546 });
    });
  });

  describe('column wrapping with small viewport', () => {
    it('should wrap to second column when viewport is too short', () => {
      const positions = calculateInitialIconPositions(mockAppIds, 400);

      // With ICON_WIDTH=88, ICON_GAP=18, iconsPerColumn=3 at 400px viewport
      expect(positions.blog).toEqual({ x: 16, y: 16 });
      expect(positions.about).toEqual({ x: 16, y: 122 });
      expect(positions.guestbook).toEqual({ x: 16, y: 228 });

      expect(positions.analytics).toEqual({ x: 122, y: 16 });
      expect(positions.resume).toEqual({ x: 122, y: 122 });
      expect(positions.etc).toEqual({ x: 122, y: 228 });
    });

    it('should wrap to multiple columns with very small viewport', () => {
      const positions = calculateInitialIconPositions(mockAppIds, 250);

      expect(positions.blog).toEqual({ x: 16, y: 16 });
      expect(positions.about).toEqual({ x: 122, y: 16 });
      expect(positions.guestbook).toEqual({ x: 228, y: 16 });
      expect(positions.analytics).toEqual({ x: 334, y: 16 });
      expect(positions.resume).toEqual({ x: 440, y: 16 });
      expect(positions.etc).toEqual({ x: 546, y: 16 });
    });
  });

  describe('default viewport height', () => {
    it('should use DEFAULT_VIEWPORT_HEIGHT (1080) when no height provided', () => {
      const withDefault = calculateInitialIconPositions(mockAppIds);
      const withExplicit = calculateInitialIconPositions(mockAppIds, 1080);

      expect(withDefault).toEqual(withExplicit);
    });
  });

  describe('edge cases', () => {
    it('should return empty object for empty app list', () => {
      const positions = calculateInitialIconPositions([], 768);
      expect(positions).toEqual({});
    });

    it('should handle single icon', () => {
      const positions = calculateInitialIconPositions(['blog'], 768);
      expect(positions).toEqual({
        blog: { x: 16, y: 16 },
      });
    });

    it('should handle very large viewport without error', () => {
      const positions = calculateInitialIconPositions(mockAppIds, 5000);

      expect(Object.keys(positions)).toHaveLength(6);
      expect(positions.blog).toEqual({ x: 16, y: 16 });
    });

    it('should ensure iconsPerColumn is at least 1 even with tiny viewport', () => {
      const positions = calculateInitialIconPositions(mockAppIds, 100);

      expect(positions.blog).toEqual({ x: 16, y: 16 });
      expect(positions.about).toEqual({ x: 122, y: 16 });
    });
  });

  describe('exported constants', () => {
    it('should export ICON_LAYOUT with correct values', () => {
      expect(ICON_LAYOUT.ICON_WIDTH).toBe(88);
      expect(ICON_LAYOUT.ICON_HEIGHT).toBe(88);
      expect(ICON_LAYOUT.ICON_GAP).toBe(18);
      expect(ICON_LAYOUT.PADDING).toBe(16);
      expect(ICON_LAYOUT.TASKBAR_HEIGHT).toBe(38);
      expect(ICON_LAYOUT.DEFAULT_VIEWPORT_HEIGHT).toBe(1080);
    });
  });
});
