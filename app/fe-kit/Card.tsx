import clsx from 'clsx';
import type { FC, HTMLProps } from 'react';

export type CardProps = HTMLProps<HTMLDivElement>;

const Header: FC<CardProps> = ({ className, ...rest }) => (
  <div
    className={clsx(
      'tw:px-4 tw:py-3 tw:rounded-t-md',
      'tw:bg-lm-primary tw:dark:bg-dm-primary tw:border-b tw:border-lm-border tw:dark:border-dm-border',
      className,
    )}
    {...rest}
  />
);

const Body: FC<CardProps> = ({ className, ...rest }) => (
  <div
    className={clsx(
      'tw:p-4 tw:bg-lm-primary tw:dark:bg-dm-primary tw:first:rounded-t-md',
      'tw:first:rounded-t-md tw:last:rounded-b-md',
      className,
    )}
    {...rest}
  />
);

const Footer: FC<CardProps> = ({ className, ...rest }) => (
  <div
    className={clsx(
      'tw:px-4 tw:py-3 tw:rounded-b-md',
      'tw:bg-lm-primary tw:dark:bg-dm-primary tw:border-t tw:border-lm-border tw:dark:border-dm-border',
      className,
    )}
    {...rest}
  />
);

const BaseCard: FC<CardProps> = ({ className, ...props }) => (
  <div
    className={clsx(
      'tw:group/card tw:rounded-md tw:shadow-md',
      'tw:border tw:border-lm-border tw:dark:border-dm-border tw:bg-lm-primary tw:dark:bg-dm-primary',
      className)}
    {...props}
  />
);

export const Card = Object.assign(BaseCard, { Body, Header, Footer });
