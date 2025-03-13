import clsx from 'clsx';
import type { FC, PropsWithChildren } from 'react';
import type { LinkProps } from 'react-router';
import { Link } from 'react-router';

export type ButtonProps = PropsWithChildren<{
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
} & ({
  /**
   * Action to be performed when this button is clicked. It will cause a `button` element to be used.
   */
  onClick?: () => void;
} | {
  /**
   * Location to go to when this button is clicked. It will cause a Link component to be used
   */
  to: LinkProps['to'];
})>;

export const Button: FC<ButtonProps> = ({ children, className, disabled, variant = 'primary', ...rest }) => {
  const Tag = 'to' in rest ? Link : 'button';

  return (
    // @ts-expect-error We are explicitly checking for the `to` prop before using Link
    <Tag
      className={clsx(
        'tw:flex tw:gap-2 tw:items-center',
        'tw:border tw:rounded-md! tw:px-3 tw:py-1.5 tw:no-underline!',
        'tw:transition-colors tw:focus-ring',
        {
          'tw:border-shlink-brand tw:text-shlink-brand': variant === 'primary',
          'tw:border-gray-400 tw:text-gray-400': variant === 'secondary',
        },
        {
          'tw:hover:text-white! tw:focus:text-white!': !disabled,
          'tw:hover:bg-shlink-brand tw:focus:bg-shlink-brand': !disabled && variant === 'primary',
          'tw:hover:bg-gray-400 tw:focus:bg-gray-400': !disabled && variant === 'secondary',
          'tw:pointer-events-none tw:opacity-65': disabled,
        },
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {children}
    </Tag>
  );
};
