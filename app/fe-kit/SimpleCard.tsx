import type { FC, ReactNode } from 'react';
import type { CardProps } from './Card';
import { Card } from './Card';

export type SimpleCardProps = Omit<CardProps, 'title'> & {
  title?: ReactNode;
  bodyClassName?: string;
};

export const SimpleCard: FC<SimpleCardProps> = ({ title, bodyClassName, children, ...rest }) => (
  <Card {...rest}>
    {title && (
      <Card.Header>
        <h5 className="tw:m-0!">{title}</h5>
      </Card.Header>
    )}
    <Card.Body className={bodyClassName}>
      {children}
    </Card.Body>
  </Card>
);
