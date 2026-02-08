import { renderHook, act } from '@/__tests__/utils/test-utils';
import { useDoubleClick } from './useDoubleClick';

describe('useDoubleClick', () => {
  let dateNowSpy: ReturnType<typeof vi.spyOn>;
  let currentTime = 1000;

  beforeEach(() => {
    currentTime = 1000;
    dateNowSpy = vi.spyOn(Date, 'now').mockImplementation(() => currentTime);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  const createMockEvent = () =>
    ({ stopPropagation: vi.fn() }) as unknown as React.MouseEvent;

  it('[init] should initialize with null clickedIdentifier', () => {
    // Arrange
    const { result } = renderHook(() => useDoubleClick<string>());

    // Act (none for init)

    // Assert
    expect(result.current.clickedIdentifier).toBeNull();
  });

  it('[click] should set identifier and stop propagation on first click', () => {
    // Arrange
    const { result } = renderHook(() => useDoubleClick<string>());
    const onDoubleClick = vi.fn();
    const mockEvent = createMockEvent();

    // Act
    act(() => {
      result.current.handleDoubleClick(mockEvent, 'icon1', onDoubleClick);
    });

    // Assert
    expect(result.current.clickedIdentifier).toBe('icon1');
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(onDoubleClick).not.toHaveBeenCalled();
  });

  it('[doubleClick] should detect within 400ms and reset state', () => {
    // Arrange
    const { result } = renderHook(() => useDoubleClick<string>());
    const onDoubleClick = vi.fn();
    const mockEvent = createMockEvent();

    // Act - First click
    currentTime = 1000;
    act(() => {
      result.current.handleDoubleClick(mockEvent, 'icon1', onDoubleClick);
    });

    // Act - Second click within 400ms
    currentTime = 1300;
    act(() => {
      result.current.handleDoubleClick(mockEvent, 'icon1', onDoubleClick);
    });

    // Assert
    expect(onDoubleClick).toHaveBeenCalledWith('icon1');
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
    expect(result.current.clickedIdentifier).toBeNull();
  });

  it('[boundary] should NOT detect at exactly 400ms threshold', () => {
    // Arrange
    const { result } = renderHook(() => useDoubleClick<string>());
    const onDoubleClick = vi.fn();
    const mockEvent = createMockEvent();

    // Act - First click
    currentTime = 1000;
    act(() => {
      result.current.handleDoubleClick(mockEvent, 'icon1', onDoubleClick);
    });

    // Act - Second click at exactly 400ms
    currentTime = 1400;
    act(() => {
      result.current.handleDoubleClick(mockEvent, 'icon1', onDoubleClick);
    });

    // Assert - Should NOT trigger
    expect(onDoubleClick).not.toHaveBeenCalled();
    expect(result.current.clickedIdentifier).toBe('icon1');

    // Act - Third click within 400ms of second
    currentTime = 1600;
    act(() => {
      result.current.handleDoubleClick(mockEvent, 'icon1', onDoubleClick);
    });

    // Assert - Should trigger
    expect(onDoubleClick).toHaveBeenCalledWith('icon1');
  });

  it('[differentId] should reset sequence when clicking different identifier', () => {
    // Arrange
    const { result } = renderHook(() => useDoubleClick<string>());
    const onDoubleClick = vi.fn();
    const mockEvent = createMockEvent();

    // Act - Click icon1
    currentTime = 1000;
    act(() => {
      result.current.handleDoubleClick(mockEvent, 'icon1', onDoubleClick);
    });

    // Act - Click icon2 within threshold
    currentTime = 1200;
    act(() => {
      result.current.handleDoubleClick(mockEvent, 'icon2', onDoubleClick);
    });

    // Assert
    expect(onDoubleClick).not.toHaveBeenCalled();
    expect(result.current.clickedIdentifier).toBe('icon2');
  });

  it('[tripleClick] should only trigger on 2nd and 4th clicks', () => {
    // Arrange
    const { result } = renderHook(() => useDoubleClick<string>());
    const onDoubleClick = vi.fn();
    const mockEvent = createMockEvent();

    // Act - 1st click
    currentTime = 1000;
    act(() => {
      result.current.handleDoubleClick(mockEvent, 'icon1', onDoubleClick);
    });

    // Act - 2nd click triggers
    currentTime = 1200;
    act(() => {
      result.current.handleDoubleClick(mockEvent, 'icon1', onDoubleClick);
    });

    // Assert - First double click
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
    expect(result.current.clickedIdentifier).toBeNull();

    // Act - 3rd click starts new sequence
    currentTime = 1300;
    act(() => {
      result.current.handleDoubleClick(mockEvent, 'icon1', onDoubleClick);
    });

    // Assert - No additional trigger
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
    expect(result.current.clickedIdentifier).toBe('icon1');

    // Act - 4th click triggers again
    currentTime = 1400;
    act(() => {
      result.current.handleDoubleClick(mockEvent, 'icon1', onDoubleClick);
    });

    // Assert - Second double click
    expect(onDoubleClick).toHaveBeenCalledTimes(2);
  });
});
