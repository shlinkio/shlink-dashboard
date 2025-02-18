import clsx from 'clsx';
import type { FC, HTMLProps, PropsWithChildren } from 'react';
import { useMemo } from 'react';
import type { NumberOrEllipsis } from './pagination';
import { pageIsEllipsis } from './pagination';
import { keyForPage, progressivePagination } from './pagination';

const buildPaginatorItemClasses = (active: boolean) => clsx(
  'tw:border-r tw:last:border-none',
  'tw:px-3 py-2 tw:cursor-pointer',
  {
    'tw:hover:bg-(--secondary-color) tw:text-shlink-brand tw:border-r-(--border-color)': !active,
    'tw:bg-(--brand-color) tw:text-white tw:border-r-(--brand-color)': active,
  },
);

type PaginatorItemProps<T extends HTMLElement> = PropsWithChildren<{
  active: boolean;
} & Omit<HTMLProps<T>, 'className'>>;

function LinkPaginatorItem({ children, active, ...anchorProps }: PaginatorItemProps<HTMLAnchorElement>) {
  const classes = useMemo(() => buildPaginatorItemClasses(active), [active]);

  return (
    <a className={classes} {...anchorProps}>
      {children}
    </a>
  );
}

function ButtonPaginatorItem({ active, children, ...buttonProps }: Omit<PaginatorItemProps<HTMLButtonElement>, 'type'>) {
  const classes = useMemo(() => buildPaginatorItemClasses(active), [active]);

  return (
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
  if (pagesCount < 2) {
    return null;
  }

  const isLinksPaginator = 'urlForPage' in rest;
  const PaginatorItem = isLinksPaginator ? LinkPaginatorItem : ButtonPaginatorItem;
  const itemProps = (pageNumber: NumberOrEllipsis) => isLinksPaginator ? {
    href: pageIsEllipsis(pageNumber) ? undefined : rest.urlForPage(pageNumber),
  } : {
    onClick: () => !pageIsEllipsis(pageNumber) && rest.onPageChange(pageNumber),
  };

  return (
    <div className="tw:select-none tw:rounded tw:border tw:border-(--border-color) tw:flex tw:overflow-hidden">
      {progressivePagination(currentPage, pagesCount).map((pageNumber, index) => (
        <PaginatorItem
          key={keyForPage(pageNumber, index)}
          active={pageNumber === currentPage}
          {...itemProps(pageNumber)}
        >
          {pageNumber}
        </PaginatorItem>
      ))}
    </div>
  );
};
