import { render } from '@testing-library/react';
import type { PaginatorProps } from '../../app/fe-kit/Paginator';
import { Paginator } from '../../app/fe-kit/Paginator';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<Paginator />', () => {
  const setUp = (props: PaginatorProps) => render(<Paginator {...props} />);

  it.each([
    { onPageChange: vi.fn() },
    { urlForPage: vi.fn().mockReturnValue('') },
  ])('passes a11y checks', (props) => checkAccessibility(setUp({ pagesCount: 10, currentPage: 5, ...props })));

  it.each([
    { pagesCount: 0, shouldRender: false },
    { pagesCount: 1, shouldRender: false },
    { pagesCount: 2, shouldRender: true },
    { pagesCount: 10, shouldRender: true },
  ])('renders empty for less than 2 pages', ({ pagesCount, shouldRender }) => {
    const { container } = setUp({ pagesCount, currentPage: 1, onPageChange: vi.fn() });

    if (shouldRender) {
      expect(container).not.toBeEmptyDOMElement();
    } else {
      expect(container).toBeEmptyDOMElement();
    }
  });
});
