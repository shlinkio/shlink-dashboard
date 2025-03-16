import type { FC } from 'react';
import { useId } from 'react';
import type { SelectProps } from './Select';
import { Select } from './Select';

export type LabelledSelectProps = Omit<SelectProps, 'className' | 'id'> & {
  label: string;
  selectClassName?: string;

  /** Same as required, but it will not cause a red asterisk to be added */
  lightRequired?: boolean;
};

export const LabelledSelect: FC<LabelledSelectProps> = ({ selectClassName, label, required, ...rest }) => {
  const id = useId();
  return (
    <div className="tw:flex tw:flex-col tw:gap-1">
      <label htmlFor={id}>
        {label}
        {required && <span className="tw:text-danger tw:ml-1">*</span>}
      </label>
      <Select id={id} className={selectClassName} required={required} {...rest} />
    </div>
  );
};
