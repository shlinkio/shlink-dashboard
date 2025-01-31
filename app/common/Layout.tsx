import type { FC, PropsWithChildren } from 'react';

export const Layout: FC<PropsWithChildren> = ({ children }) => (
  <div className="tw:container tw:lg:p-5 tw:p-3 tw:mx-auto tw:h-full">
    {children}
  </div>
);
