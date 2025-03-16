import type { FC } from 'react';
import { useId } from 'react';
import type { InputProps } from './Input';
import { Input } from './Input';
import { Label } from './Label';

export type LabelledInputProps = Omit<InputProps, 'className' | 'id'> & {
  label: string;
  inputClassName?: string;

  /** Alternative to `required`. Causes the input to be required, without displaying an asterisk */
  hiddenRequired?: boolean;
};

export const LabelledInput: FC<LabelledInputProps> = ({ label, inputClassName, required, hiddenRequired, ...rest }) => {
  const id = useId();
  return (
    <div className="tw:flex tw:flex-col tw:gap-1">
      <Label htmlFor={id} required={required} hiddenRequired={hiddenRequired}>{label}</Label>
      <Input id={id} className={inputClassName} required={required || hiddenRequired} {...rest} />
    </div>
  );
};
