import type { FC, PropsWithChildren } from 'react';
import { useIsClient } from '../utils/hooks';

/**
 * Renders children only when running in the browser, avoiding errors when rendering components that depend in
 * browser-specific APIs
 */
export const ClientOnly: FC<PropsWithChildren> = ({ children }) => {
  const isClient = useIsClient();
  return isClient && children;
};
