import type { FC, HTMLProps } from 'react';

export type LabelProps = HTMLProps<HTMLLabelElement> & {
  required?: boolean;

  /**
   * If set to true, it hides the asterisk that would be displayed when `required` is true.
   * Defaults to `false`.
   */
  hiddenRequired?: boolean;
};

export const Label: FC<LabelProps> = ({ required, hiddenRequired = false, children, ...rest }) => (
  <label {...rest}>
    {children}
    {required && !hiddenRequired && <span className="tw:text-danger tw:ml-1">*</span>}
  </label>
);
