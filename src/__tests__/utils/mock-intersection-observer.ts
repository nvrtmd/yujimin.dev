import { vi } from 'vitest';

export class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {}

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);

  // Helper to trigger intersection
  trigger(isIntersecting: boolean) {
    const entries = [
      {
        isIntersecting,
        target: document.createElement('div'),
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      },
    ];
    this.callback(entries, this);
  }
}
