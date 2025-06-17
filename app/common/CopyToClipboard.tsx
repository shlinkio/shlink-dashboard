import { CopyToClipboardButton } from '@shlinkio/shlink-frontend-kit';
import type { FC, PropsWithChildren } from 'react';

export type CopyToClipboardProps = PropsWithChildren<{
  text: string;
}>;

/**
 * Displays a copy-to-clipboard button next to a piece of text, and copies that text when clicked.
 */
export const CopyToClipboard: FC<CopyToClipboardProps> = (
  { text, children = text },
) => {
  return (
    <span className="inline-flex items-center gap-x-1">
      {children}
      <CopyToClipboardButton text={text} size="sm" />
    </span>
  );
};
