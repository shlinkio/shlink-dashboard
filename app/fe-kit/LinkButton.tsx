import clsx from 'clsx';
import type { FC, HTMLProps } from 'react';
import type { Size } from './types';

export type LinkButtonProps = Omit<HTMLProps<HTMLButtonElement>, 'size'> & {
  size?: Size;
};

export const LinkButton: FC<LinkButtonProps> = ({ className, disabled, size = 'md', ...rest }) => (
  // @ts-expect-error `type` is inferred as `string` instead of the union of actually supported values
  <button
    className={clsx(
      'tw:inline-flex tw:rounded-md! tw:focus-ring',
      'tw:text-brand tw:highlight:text-brand-dark tw:highlight:underline',
      {
        'tw:px-1.5 tw:py-1 tw:text-sm': size === 'sm',
        'tw:px-3 tw:py-1.5': size === 'md',
        'tw:px-4 tw:py-2 tw:text-lg': size === 'lg',
        'tw:pointer-events-none tw:opacity-65': disabled,
      },
      className,
    )}
    disabled={disabled}
    {...rest}
  />
);
