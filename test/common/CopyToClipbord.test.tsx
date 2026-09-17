import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CopyToClipboard } from '../../app/common/CopyToClipboard';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<CopyToClipboard />', () => {
  const setUp = (children?: ReactNode) => render(<CopyToClipboard text="The text">{children}</CopyToClipboard>);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    { children: undefined, expectedContent: 'The text' },
    { children: 'Something else', expectedContent: 'Something else' },
  ])('shows children if provided, otherwise falls back ot text', async ({ children, expectedContent }) => {
    const { container } = setUp(children);
    await expect.element(container.firstChild as HTMLElement).toHaveTextContent(expectedContent);
  });
});
