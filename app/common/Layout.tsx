import { clsx } from 'clsx';
import type { FC, PropsWithChildren } from 'react';

export type LayoutProps = PropsWithChildren<{
  className?: string;
  flexColumn?: boolean;
}>;

export const Layout: FC<LayoutProps> = ({ children, flexColumn, className }) => (
  <div
    className={clsx(
      'grow container lg:p-5 p-3 mx-auto h-full',
      { 'flex flex-col gap-y-4': flexColumn },
      className,
    )}
  >
    {children}
  </div>
);
