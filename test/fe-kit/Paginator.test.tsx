import { screen } from '@testing-library/react';
import { ELLIPSIS } from '../../app/fe-kit/pagination';
import type { PaginatorProps } from '../../app/fe-kit/Paginator';
import { Paginator } from '../../app/fe-kit/Paginator';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/set-up-test';

describe('<Paginator />', () => {
  const setUp = (props: PaginatorProps) => renderWithEvents(<Paginator {...props} />);

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

  it.each([
    { currentPage: 1, expectedPrevPage: 1, expectedNextPage: 2 },
    { currentPage: 10, expectedPrevPage: 9, expectedNextPage: 10 },
    { currentPage: 5, expectedPrevPage: 4, expectedNextPage: 6 },
  ])('next and prev pages point to the right page', ({ currentPage, expectedPrevPage, expectedNextPage }) => {
    setUp({
      pagesCount: 10,
      currentPage,
      urlForPage: vi.fn().mockImplementation((page) => page),
    });

    expect(screen.getByLabelText('Previous')).toHaveAttribute('href', `${expectedPrevPage}`);
    expect(screen.getByLabelText('Next')).toHaveAttribute('href', `${expectedNextPage}`);
  });

  it.each([
    {
      pagesCount: 10,
      currentPage: 2,
      expectedPages: [1, 2, 3, 4, 10],
      expectedEllipsis: 1,
    },
    {
      pagesCount: 10,
      currentPage: 3,
      expectedPages: [1, 2, 3, 4, 5, 10],
      expectedEllipsis: 1,
    },
    {
      pagesCount: 10,
      currentPage: 5,
      expectedPages: [1, 3, 4, 5, 6, 7, 10],
      expectedEllipsis: 2,
    },
    {
      pagesCount: 10,
      currentPage: 10,
      expectedPages: [1, 8, 9, 10],
      expectedEllipsis: 1,
    },
    {
      pagesCount: 4,
      currentPage: 2,
      expectedPages: [1, 2, 3, 4],
      expectedEllipsis: 0,
    },
    {
      pagesCount: 5,
      currentPage: 3,
      expectedPages: [1, 2, 3, 4, 5],
      expectedEllipsis: 0,
    },
  ])('renders expected amount of pages', ({ pagesCount, currentPage, expectedPages, expectedEllipsis }) => {
    setUp({ pagesCount, currentPage, onPageChange: vi.fn() });

    expect(screen.getAllByRole('button', { name: /^\d+$/ })).toHaveLength(expectedPages.length);
    expect(screen.queryAllByText(ELLIPSIS)).toHaveLength(expectedEllipsis);

    expectedPages.forEach((pageNumber) => expect(screen.getByText(`${pageNumber}`)).toBeInTheDocument());
  });

  it.each([
    { getButton: () => screen.queryAllByText(ELLIPSIS)[0], shouldInvoke: false },
    { getButton: () => screen.getByText('4'), shouldInvoke: true },
  ])('invokes onPageChange when a non-ellipsis page is clicked', async ({ getButton, shouldInvoke }) => {
    const onPageChange= vi.fn();
    const { user } = setUp({ onPageChange, currentPage: 5, pagesCount: 10 });

    await user.click(getButton());

    if (shouldInvoke) {
      expect(onPageChange).toHaveBeenCalled();
    } else {
      expect(onPageChange).not.toHaveBeenCalled();
    }
  });
});
