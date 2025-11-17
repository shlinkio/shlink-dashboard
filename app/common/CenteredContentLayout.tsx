import type { FC, PropsWithChildren } from 'react';
import { Layout } from './Layout';

/**
 * A Layout used to render single-node children which will cause them to be centered on the viewport while space is
 * available.
 * Once children do not fit, vertical scroll will appear normally.
 */
export const CenteredContentLayout: FC<PropsWithChildren> = ({ children }) => (
  <Layout className="flex items-center justify-center">
    <div className="m-auto w-full xl:w-3/5 lg:w-3/4">
      {children}
    </div>
  </Layout>
);
