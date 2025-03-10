import clsx from 'clsx';
import type { FC, PropsWithChildren } from 'react';

export type LayoutProps = PropsWithChildren<{
  className?: string;
}>;

export const Layout: FC<LayoutProps> = ({ children, className }) => (
  <div className={clsx('tw:container tw:lg:p-5 tw:p-3 tw:mx-auto tw:h-full', className)}>
    {children}
  </div>
);
