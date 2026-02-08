import { renderHook, act, waitFor } from '@/__tests__/utils/test-utils';
import { useMobile } from './useMobile';

describe('useMobile', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  const setInnerWidth = (value: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value,
    });
  };

  it('[boundary] should return true at 767px (mobile)', async () => {
    // Arrange
    setInnerWidth(767);

    // Act
    const { result } = renderHook(() => useMobile());

    // Assert
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('[boundary] should return false at 768px (desktop)', async () => {
    // Arrange
    setInnerWidth(768);

    // Act
    const { result } = renderHook(() => useMobile());

    // Assert
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('[resize] should update state on viewport change', async () => {
    // Arrange
    setInnerWidth(1024);
    const { result } = renderHook(() => useMobile());
    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    // Act
    act(() => {
      setInnerWidth(500);
      window.dispatchEvent(new Event('resize'));
    });

    // Assert
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
