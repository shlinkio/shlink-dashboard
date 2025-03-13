import clsx from 'clsx';
import type { FC, InputHTMLAttributes } from 'react';

type BaseInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export type InputProps = BaseInputProps & {
  borderless?: boolean;
  variant?: 'input' | 'primary';
  size?: 'sm' | 'md' | 'lg';
};

export const Input: FC<InputProps> = ({
  borderless = false,
  variant = 'input',
  size = 'md',
  className,
  ...rest
}) => (
  <input
    onChange={(e) => e.target.value}
    className={clsx(
      'tw:w-full tw:focus-ring',
      {
        'tw:px-2 tw:py-1 tw:text-sm!': size === 'sm',
        'tw:px-3 tw:py-1.5': size === 'md',
        'tw:px-4 tw:py-2 tw:text-xl!': size === 'lg',
        'tw:bg-(--primary-color)': variant === 'primary',
        'tw:bg-(--input-color)': variant === 'input',
        'tw:rounded-md tw:border tw:border-(--input-border-color)': !borderless,
      },
      className,
    )}
    {...rest}
  />
);
