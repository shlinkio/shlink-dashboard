import type { FC } from 'react';
import { useId } from 'react';
import type { InputProps } from './Input';
import { Input } from './Input';

export type LabelledInputProps = Omit<InputProps, 'className' | 'id'> & {
  label: string;
  inputClassName?: string;
};

export const LabelledInput: FC<LabelledInputProps> = ({ label, inputClassName, required, ...rest }) => {
  const id = useId();
  return (
    <div className="tw:flex tw:flex-col tw:gap-1">
      <label htmlFor={id}>
        {label}
        {required && <span className="tw:text-danger tw:ml-1">*</span>}
      </label>
      <Input id={id} className={inputClassName} required={required} {...rest} />
    </div>
  );
};
