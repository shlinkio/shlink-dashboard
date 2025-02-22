import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import type { FC, HTMLProps, PropsWithChildren } from 'react';
import { useCallback } from 'react';
import { useMemo } from 'react';
import type { NumberOrEllipsis } from './pagination';
import { ELLIPSIS, keyForPage, pageIsEllipsis, prettifyPageNumber, progressivePagination } from './pagination';

const buildPaginatorItemClasses = (active = false) => clsx(
  'tw:border-r tw:last:border-none',
  'tw:px-3 py-2 tw:cursor-pointer tw:no-underline!',
  {
    'tw:hover:bg-(--secondary-color) tw:text-shlink-brand tw:border-r-(--border-color)': !active,
    'tw:bg-(--brand-color) tw:text-white! tw:border-r-(--brand-color)': active,
  },
);

type BasePaginatorItemProps = {
  active?: boolean;
  isEllipsis?: boolean;
};

type PaginatorItemProps<T extends HTMLElement> =
  PropsWithChildren<BasePaginatorItemProps & Omit<HTMLProps<T>, 'className'>>;

function EllipsisPaginatorItem() {
  return (
    <span
      aria-hidden
      className="tw:border-r tw:last:border-none tw:px-3 py-2 tw:text-gray-400 tw:border-r-(--border-color)"
    >
      {ELLIPSIS}
    </span>
  );
}

function LinkPaginatorItem(
  { children, active, isEllipsis, href, ...anchorProps }: PaginatorItemProps<HTMLAnchorElement>,
) {
  const classes = useMemo(() => buildPaginatorItemClasses(active), [active]);

  return isEllipsis ? <EllipsisPaginatorItem /> : (
    <a className={classes} href={href} {...anchorProps}>
      {children}
    </a>
  );
}

function ButtonPaginatorItem(
  { children, active, isEllipsis, ...buttonProps }: Omit<PaginatorItemProps<HTMLButtonElement>, 'type'>,
) {
  const classes = useMemo(() => buildPaginatorItemClasses(active), [active]);
  return isEllipsis ? <EllipsisPaginatorItem /> : (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

export type PaginatorProps = {
  pagesCount: number;
  currentPage: number;
} & ({
  onPageChange: (currentPage: number) => void;
} | {
  urlForPage: (pageNumber: number) => string;
});

export const Paginator: FC<PaginatorProps> = ({ currentPage, pagesCount, ...rest }) => {
  const isLinksPaginator = 'urlForPage' in rest;
  const PaginatorItem = isLinksPaginator ? LinkPaginatorItem : ButtonPaginatorItem;
  const itemPropsForPageNumber = useCallback(
    (pageNumber: NumberOrEllipsis) => isLinksPaginator
      ? { href: pageIsEllipsis(pageNumber) ? undefined : rest.urlForPage(pageNumber) }
      : { onClick: () => !pageIsEllipsis(pageNumber) && rest.onPageChange(pageNumber) },
    [isLinksPaginator, rest],
  );

  if (pagesCount < 2) {
    return null;
  }

  return (
    <div
      className="tw:select-none tw:rounded tw:border tw:border-(--border-color) tw:flex tw:overflow-hidden"
      data-testid="paginator"
    >
      <PaginatorItem {...itemPropsForPageNumber(Math.max(1, currentPage - 1))} aria-label="Previous">
        <FontAwesomeIcon size="xs" icon={faChevronLeft} />
      </PaginatorItem>
      {progressivePagination(currentPage, pagesCount).map((pageNumber, index) => (
        <PaginatorItem
          key={keyForPage(pageNumber, index)}
          active={pageNumber === currentPage}
          isEllipsis={pageIsEllipsis(pageNumber)}
          {...itemPropsForPageNumber(pageNumber)}
        >
          {prettifyPageNumber(pageNumber)}
        </PaginatorItem>
      ))}
      <PaginatorItem {...itemPropsForPageNumber(Math.min(pagesCount, currentPage + 1))} aria-label="Next">
        <FontAwesomeIcon size="xs" icon={faChevronRight} />
      </PaginatorItem>
    </div>
  );
};
