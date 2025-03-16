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
  variant?: 'primary' | 'secondary' | 'danger';
  size?: Size;
  inline?: boolean;
  solid?: boolean;
} & (RegularButtonProps | LinkButtonProps)>;

export const Button: FC<ButtonProps> = ({
  children,
  className,
  disabled,
  variant = 'primary',
  size = 'md',
  inline = false,
  solid = false,
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
          'tw:px-1.5 tw:py-1 tw:text-sm': size === 'sm',
          'tw:px-3 tw:py-1.5': size === 'md',
          'tw:px-4 tw:py-2 tw:text-lg': size === 'lg',
        },
        {
          'tw:border-brand tw:text-brand': variant === 'primary',
          'tw:border-zinc-500': variant === 'secondary',
          'tw:text-zinc-500!': variant === 'secondary' && !solid,
          'tw:border-danger': variant === 'danger',
          'tw:text-danger!': variant === 'danger' && !solid,
        },
        solid && {
          'tw:text-white!': true,
          'tw:bg-brand': variant === 'primary',
          'tw:hover:bg-brand-dark tw:hover:border-brand-dark': variant === 'primary',
          'tw:focus:bg-brand-dark tw:focus:border-brand-dark': variant === 'primary',

          'tw:bg-zinc-500': variant === 'secondary',
          'tw:hover:bg-zinc-600 tw:hover:border-zinc-600 tw:focus:bg-zinc-600 tw:focus:border-zinc-600': variant === 'secondary',

          'tw:bg-danger': variant === 'danger',
          'tw:hover:bg-danger-dark tw:hover:border-danger-dark tw:focus:bg-danger-dark tw:focus:border-danger-dark': variant === 'danger',
        },
        !disabled && {
          'tw:hover:text-white! tw:focus:text-white!': !solid,
          'tw:hover:bg-brand tw:focus:bg-brand': variant === 'primary',
          'tw:hover:bg-zinc-500 tw:focus:bg-zinc-500': variant === 'secondary',
          'tw:hover:bg-danger tw:focus:bg-danger': variant === 'danger',
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
