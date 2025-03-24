import clsx from 'clsx';
import type { FC, HTMLProps, PropsWithChildren } from 'react';
import type { BaseInputProps } from './Input';

type SelectElementProps = Omit<HTMLProps<HTMLSelectElement>, 'size'>;

export type SelectProps = PropsWithChildren<SelectElementProps & BaseInputProps>;

const chevronImageUrl = String.raw`data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/></svg>`;

export const Select: FC<SelectProps> = ({
  className,
  size = 'md',
  feedback,
  style = {},
  disabled,
  ...rest
}) => (
  <select
    className={clsx(
      'tw:w-full tw:appearance-none tw:pr-9 tw:bg-no-repeat',
      {
        'tw:focus-ring': !feedback,
        'tw:focus-ring-danger': feedback === 'error',
      },
      'tw:rounded-md tw:border',
      {
        'tw:border-lm-input-border tw:dark:border-dm-input-border': !feedback,
        'tw:border-danger': feedback === 'error',
      },
      {
        'tw:pl-2 tw:py-1 tw:text-sm': size === 'sm',
        'tw:pl-3 tw:py-1.5': size === 'md',
        'tw:pl-4 tw:py-2 tw:text-xl': size === 'lg',
        'tw:bg-lm-disabled-input tw:dark:bg-dm-disabled-input': disabled,
        // Apply different background color when rendered inside a card
        'tw:bg-lm-primary tw:dark:bg-dm-primary tw:group-[&]/card:bg-lm-input tw:group-[&]/card:dark:bg-dm-input': !disabled,
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
