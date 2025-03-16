import type { FC } from 'react';
import { useId } from 'react';
import type { InputProps } from './Input';
import { Input } from './Input';
import { Label } from './Label';

export type LabelledInputProps = Omit<InputProps, 'className' | 'id'> & {
  label: string;
  inputClassName?: string;
};

export const LabelledInput: FC<LabelledInputProps> = ({ label, inputClassName, required, ...rest }) => {
  const id = useId();
  return (
    <div className="tw:flex tw:flex-col tw:gap-1">
      <Label htmlFor={id} required={required}>{label}</Label>
      <Input id={id} className={inputClassName} required={required} {...rest} />
    </div>
  );
};
