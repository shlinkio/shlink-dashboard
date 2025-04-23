import clsx from 'clsx';
import type { FC, PropsWithChildren } from 'react';

export type LayoutProps = PropsWithChildren<{
  className?: string;
  flexColumn?: boolean;
}>;

export const Layout: FC<LayoutProps> = ({ children, flexColumn, className }) => (
  <div
    className={clsx(
      'tw:container tw:lg:p-5 tw:p-3 tw:mx-auto tw:h-full',
      { 'tw:flex tw:flex-col tw:gap-y-4': flexColumn },
      className,
    )}
  >
    {children}
  </div>
);
