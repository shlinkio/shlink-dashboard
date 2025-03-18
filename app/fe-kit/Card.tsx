import clsx from 'clsx';
import type { FC, HTMLProps } from 'react';

export type CardProps = HTMLProps<HTMLDivElement>;

const Header: FC<CardProps> = ({ className, ...rest }) => (
  <div
    className={clsx(
      'tw:px-4 tw:py-3 tw:bg-(--primary-color) tw:border tw:border-(--border-color) tw:rounded-t-md',
      className,
    )}
    {...rest}
  />
);

const Body: FC<CardProps> = ({ className, ...rest }) => (
  <div
    className={clsx(
      'tw:p-4 tw:bg-(--primary-color) tw:first:rounded-t-md',
      'tw:border-x tw:first:border-t tw:last:border-b tw:border-(--border-color)',
      'tw:first:rounded-t-md tw:last:rounded-b-md',
      className,
    )}
    {...rest}
  />
);

const Footer: FC<CardProps> = ({ className, ...rest }) => (
  <div
    className={clsx(
      'tw:px-4 tw:py-3 tw:bg-(--primary-color) tw:border tw:border-(--border-color) tw:rounded-b-md',
      className,
    )}
    {...rest}
  />
);

const BaseCard: FC<CardProps> = ({ className, ...props }) => (
  <div className={clsx('tw:group/card tw:shadow-md', className)} {...props} />
);

export const Card = Object.assign(BaseCard, { Body, Header, Footer });
