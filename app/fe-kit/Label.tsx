import type { FC, HTMLProps } from 'react';

export type LabelProps = HTMLProps<HTMLLabelElement> & {
  required?: boolean;
};

export const Label: FC<LabelProps> = ({ required, children, ...rest }) => (
  <label {...rest}>
    {children}
    {required && <span className="tw:text-danger tw:ml-1">*</span>}
  </label>
);
