import type { SearchInputProps } from '@shlinkio/shlink-frontend-kit/tailwind';
import { SearchInput } from '@shlinkio/shlink-frontend-kit/tailwind';
import { fireEvent, render, screen } from '@testing-library/react';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<SearchInput />', () => {
  const onChange = vi.fn();
  const setUp = (props: Partial<SearchInputProps> = {}) => render(<SearchInput onChange={onChange} {...props} />);

  // Using fireEvents instead of user-event, because the async nature of the later hides the fact that onChange is
  // invoked asynchronously
  const onSearchInputChange = (value: string) => fireEvent.change(screen.getByRole('searchbox'), {
    target: { value },
  });

  beforeEach(() => {
    // Make all timeouts be still async, but resolve immediately
    const globalSetTimeout = setTimeout;
    vi.stubGlobal('setTimeout', (callback: () => unknown) => globalSetTimeout(callback, 0));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    { borderless: true },
    { defaultValue: 'Hello' },
  ])('passes a11y checks', (props) => checkAccessibility(setUp(props)));

  it('invokes onChange immediately when the value is empty', () => {
    setUp({ defaultValue: 'Hello' });

    onSearchInputChange('');
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('invokes onChange with a delay when the value is not empty', async () => {
    setUp();
    onSearchInputChange('something');

    // The callback is not invoked until the next tick
    expect(onChange).not.toHaveBeenCalled();
    await new Promise((res) => setTimeout(res, 0));
    expect(onChange).toHaveBeenCalledWith('something');
  });

  it.each([
    { borderless: true },
    { defaultValue: 'something' },
    { containerClassName: 'something' },
    { inputClassName: 'something' },
  ])('applies visual changes for some props', (props) => {
    const { container } = setUp(props);
    expect(container).toMatchSnapshot();
  });
});
