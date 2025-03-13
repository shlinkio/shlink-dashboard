import type { FC } from 'react';
import { useId } from 'react';
import type { SelectProps } from './Select';
import { Select } from './Select';

export type LabelledSelectProps = Omit<SelectProps, 'className' | 'id'> & {
  label: string;
  selectClassName?: string;
};

export const LabelledSelect: FC<LabelledSelectProps> = ({ selectClassName, label, ...rest }) => {
  const id = useId();
  return (
    <div className="tw:flex tw:flex-col tw:gap-1">
      <label htmlFor={id}>{label.endsWith(':') ? label : `${label}:`}</label>
      <Select id={id} className={selectClassName} {...rest} />
    </div>
  );
};
