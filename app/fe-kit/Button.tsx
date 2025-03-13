import clsx from 'clsx';
import type { FC, HTMLProps, PropsWithChildren } from 'react';
import type { LinkProps } from 'react-router';
import { Link } from 'react-router';
import type { Size } from './types';

type RegularButtonProps = HTMLProps<HTMLButtonElement>;
type LinkButtonProps = LinkProps;

export type ButtonProps = PropsWithChildren<{
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: Size;
  inline?: boolean;
} & (RegularButtonProps | LinkButtonProps)>;

export const Button: FC<ButtonProps> = ({
  children,
  className,
  disabled,
  variant = 'primary',
  size = 'md',
  inline = false,
  ...rest
}) => {
  const Tag = 'to' in rest ? Link : 'button';

  return (
    // @ts-expect-error We are explicitly checking for the `to` prop before using Link
    <Tag
      className={clsx(
        {
          'tw:inline-flex': inline,
          'tw:flex': !inline,
        },
        'tw:gap-2 tw:items-center tw:justify-center',
        'tw:border tw:rounded-md! tw:no-underline!',
        'tw:transition-colors tw:focus-ring',
        {
          'tw:px-2 tw:py-1 tw:text-sm': size === 'sm',
          'tw:px-3 tw:py-1.5': size === 'md',
          'tw:px-4 tw:py-2 tw:text-lg': size === 'lg',
          'tw:border-shlink-brand tw:text-shlink-brand': variant === 'primary',
          'tw:border-gray-400 tw:text-gray-400': variant === 'secondary',
        },
        !disabled && {
          'tw:hover:text-white! tw:focus:text-white!': true,
          'tw:hover:bg-shlink-brand tw:focus:bg-shlink-brand': variant === 'primary',
          'tw:hover:bg-gray-400 tw:focus:bg-gray-400': variant === 'secondary',
        },
        {
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
