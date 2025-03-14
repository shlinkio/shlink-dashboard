import clsx from 'clsx';
import type { FC, HTMLProps, PropsWithChildren } from 'react';
import type { Size } from './types';

type SelectElementProps = Omit<HTMLProps<HTMLSelectElement>, 'size'>;

export type SelectProps = PropsWithChildren<SelectElementProps & {
  variant?: 'input' | 'primary';
  size?: Size;
}>;

const chevronImageUrl = String.raw`data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/></svg>`;

export const Select: FC<SelectProps> = ({
  className,
  size = 'md',
  variant = 'input',
  style = {},
  disabled,
  ...rest
}) => (
  <select
    className={clsx(
      'tw:w-full tw:focus-ring tw:appearance-none',
      'tw:rounded-md tw:border tw:border-(--input-border-color)',
      'tw:pr-9 tw:bg-no-repeat',
      {
        'tw:pl-2 tw:py-1 tw:text-sm!': size === 'sm',
        'tw:pl-3 tw:py-1.5': size === 'md',
        'tw:pl-4 tw:py-2 tw:text-xl!': size === 'lg',
        'tw:bg-(--input-disabled-color)': disabled,
      },
      !disabled && {
        'tw:bg-(--primary-color)': variant === 'primary',
        'tw:bg-(--input-color)': variant === 'input',
      },
      className,
    )}
    style={{
      ...style,
      backgroundImage: `url("${chevronImageUrl}")`,
      backgroundSize: '16px 12px',
      backgroundPosition: 'right 0.75rem center',
    }}
    disabled={disabled}
    {...rest}
  />
);
