import { useTimeout } from '@shlinkio/shlink-frontend-kit/tailwind';
import { screen } from '@testing-library/react';
import type { FC } from 'react';
import { renderWithEvents } from '../__helpers__/set-up-test';

describe('use-timeout', () => {
  const DEFAULT_DELAY = 100;
  const EXPLICIT_DELAY = 500;

  // Keep asynchronous nature of setTimeout, but avoid unnecessary delays
  const setTimeoutMock = vi.fn().mockImplementation((callback) => globalThis.setTimeout(callback, 0));
  const clearTimeoutMock = vi.fn();
  const callback = vi.fn();

  const FakeComponent: FC<{ callback: () => unknown }> = ({ callback }) => {
    const { setTimeout, clearCurrentTimeout } = useTimeout(DEFAULT_DELAY, setTimeoutMock as any, clearTimeoutMock);

    return (
      <div>
        <button data-testid="set-timeout" onClick={() => setTimeout(callback)}>Set timeout</button>
        <button data-testid="set-delayed-timeout" onClick={() => setTimeout(callback, EXPLICIT_DELAY)}>
          Set timeout with explicit delay
        </button>
        <button data-testid="clear-timeout" onClick={clearCurrentTimeout}>Clear timeout</button>
      </div>
    );
  };

  const setUp = () => renderWithEvents(<FakeComponent callback={callback} />);

  it.each([
    { testId: 'set-timeout', expectedDelay: DEFAULT_DELAY },
    { testId: 'set-delayed-timeout', expectedDelay: EXPLICIT_DELAY },
  ])('sets timeout with expected delay', async ({ testId, expectedDelay }) => {
    const { user } = setUp();
    await user.click(screen.getByTestId(testId));

    expect(setTimeoutMock).toHaveBeenCalledWith(expect.any(Function), expectedDelay);
    expect(callback).toHaveBeenCalled();
  });

  it('can clear previous timeout explicitly', async () => {
    const { user } = setUp();

    // Trying to clear the timeout before setting one does nothing
    await user.click(screen.getByTestId('clear-timeout'));
    expect(clearTimeoutMock).not.toHaveBeenCalled();

    // Let's set a timeout, then try to clear it.
    // We don't await here, otherwise the timeout will get cleared automatically.
    const setTimeoutPromise = user.click(screen.getByTestId('set-timeout'));
    await user.click(screen.getByTestId('clear-timeout'));
    expect(clearTimeoutMock).toHaveBeenCalled();

    await setTimeoutPromise;
  });

  it('clears previous timeout when the component is unmounted', async () => {
    const { user, unmount } = setUp();

    setTimeoutMock.mockImplementation(() => 1);
    await user.click(screen.getByTestId('set-timeout'));
    unmount();
    expect(clearTimeoutMock).toHaveBeenCalled();
  });
});
