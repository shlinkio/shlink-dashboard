import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import type { FC } from 'react';

export type CloseButtonProps = {
  onClick?: () => void;
};

export const CloseButton: FC<CloseButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className={clsx(
      'tw:opacity-50 tw:highlight:opacity-80 tw:transition-opacity',
      'tw:rounded-md! tw:focus-ring',
    )}
  >
    <FontAwesomeIcon icon={faClose} size="xl" />
  </button>
);
