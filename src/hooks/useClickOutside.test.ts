import { renderHook } from '@/__tests__/utils/test-utils';
import { useClickOutside } from './useClickOutside';
import { RefObject } from 'react';

function createRefWithElement(): {
  ref: RefObject<HTMLDivElement>;
  element: HTMLDivElement;
} {
  const element = document.createElement('div');
  document.body.appendChild(element);
  const ref = { current: element } as RefObject<HTMLDivElement>;
  return { ref, element };
}

function createNullRef(): RefObject<HTMLDivElement> {
  return { current: null } as unknown as RefObject<HTMLDivElement>;
}

describe('useClickOutside', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('[mousedown] should call handler when clicking outside the element', () => {
    // Arrange
    const { ref } = createRefWithElement();
    const handler = vi.fn();

    renderHook(() => useClickOutside(ref, handler));

    // Act
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    // Assert
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  it('[touchstart] should call handler when touching outside the element', () => {
    // Arrange
    const { ref } = createRefWithElement();
    const handler = vi.fn();

    renderHook(() => useClickOutside(ref, handler));

    // Act
    document.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));

    // Assert
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(expect.any(TouchEvent));
  });

  it('[inside] should NOT call handler when clicking inside the element', () => {
    // Arrange
    const { ref, element } = createRefWithElement();
    const child = document.createElement('span');
    element.appendChild(child);
    const handler = vi.fn();

    renderHook(() => useClickOutside(ref, handler));

    // Act - click on the element itself
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    // Assert
    expect(handler).not.toHaveBeenCalled();

    // Act - click on a child element
    child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    // Assert
    expect(handler).not.toHaveBeenCalled();
  });

  it('[disabled] should NOT call handler when enabled is false', () => {
    // Arrange
    const { ref } = createRefWithElement();
    const handler = vi.fn();

    renderHook(() => useClickOutside(ref, handler, false));

    // Act
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    // Assert
    expect(handler).not.toHaveBeenCalled();
  });

  it('[nullRef] should NOT call handler when ref.current is null', () => {
    // Arrange
    const ref = createNullRef();
    const handler = vi.fn();

    renderHook(() => useClickOutside(ref, handler));

    // Act
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    // Assert
    expect(handler).not.toHaveBeenCalled();
  });

  it('[cleanup] should remove listeners on unmount', () => {
    // Arrange
    const { ref } = createRefWithElement();
    const handler = vi.fn();

    const { unmount } = renderHook(() => useClickOutside(ref, handler));

    // Act
    unmount();
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    document.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));

    // Assert
    expect(handler).not.toHaveBeenCalled();
  });

  it('[toggle] should attach and detach listeners when enabled changes', () => {
    // Arrange
    const { ref } = createRefWithElement();
    const handler = vi.fn();

    const { rerender } = renderHook(
      ({ enabled }) => useClickOutside(ref, handler, enabled),
      { initialProps: { enabled: true } },
    );

    // Act & Assert - enabled: handler is called
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);

    // Act - disable
    rerender({ enabled: false });
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    // Assert - handler not called again
    expect(handler).toHaveBeenCalledTimes(1);

    // Act - re-enable
    rerender({ enabled: true });
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    // Assert - handler called again
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
