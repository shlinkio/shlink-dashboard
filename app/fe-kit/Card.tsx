import clsx from 'clsx';
import type { FC, HTMLProps } from 'react';

export type CardProps = HTMLProps<HTMLDivElement>;

const Header: FC<CardProps> = ({ className, ...rest }) => (
  <div className={clsx('tw:px-4 tw:py-3 tw:border-b tw:border-(--border-color)', className)} {...rest} />
);

const Body: FC<CardProps> = ({ className, ...rest }) => (
  <div className={clsx('tw:p-4', className)} {...rest} />
);

const Footer: FC<CardProps> = ({ className, ...rest }) => (
  <div className={clsx('tw:px-4 tw:py-3 tw:border-t tw:border-(--border-color)', className)} {...rest} />
);

const BaseCard: FC<CardProps> = ({ className, ...props }) => (
  <div
    className={clsx(
      'tw:group/card tw:rounded-md tw:shadow-md',
      'tw:border tw:border-(--border-color) tw:bg-(--primary-color)',
      className,
    )}
    {...props}
  />
);

export const Card = Object.assign(BaseCard, { Body, Header, Footer });
