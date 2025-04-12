import { faClone } from '@fortawesome/free-regular-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC, PropsWithChildren } from 'react';
import { useCallback } from 'react';

export type CopyToClipboardProps = PropsWithChildren<{
  text: string;

  /** Test seam */
  navigator_?: typeof globalThis.navigator;
}>;

/**
 * Displays a copy-to-clipboard button next to a piece of text, and copies that text when clicked.
 */
export const CopyToClipboard: FC<CopyToClipboardProps> = (
  { text, children = text, navigator_ = globalThis.navigator },
) => {
  const [copied, toggleCopied] = useTimeoutToggle({ delay: 1000 });
  const copyToClipboard = useCallback(
    () => navigator_.clipboard.writeText(text).then(toggleCopied),
    [navigator_.clipboard, text, toggleCopied],
  );

  return (
    <span className="tw:inline-flex tw:items-center tw:gap-x-1">
      {children}
      <button
        type="button"
        onClick={copyToClipboard}
        title="Copy to clipboard"
        aria-label="Copy to clipboard"
        className="tw:focus-ring tw:rounded-sm"
      >
        <FontAwesomeIcon icon={copied ? faCheck : faClone} fixedWidth />
      </button>
    </span>
  );
};
