import type { FC } from 'react';
import { useId } from 'react';
import type { InputProps } from './Input';
import { Input } from './Input';
import { Label } from './Label';

export type LabelledInputProps = Omit<InputProps, 'className' | 'id' | 'feedback'> & {
  label: string;
  inputClassName?: string;
  error?: string;

  /** Alternative to `required`. Causes the input to be required, without displaying an asterisk */
  hiddenRequired?: boolean;
};

export const LabelledInput: FC<LabelledInputProps> = (
  { label, inputClassName, required, hiddenRequired, error, ...rest },
) => {
  const id = useId();
  return (
    <div className="tw:flex tw:flex-col tw:gap-1">
      <Label htmlFor={id} required={required}>{label}</Label>
      <Input
        id={id}
        className={inputClassName}
        required={required || hiddenRequired}
        feedback={error ? 'error' : undefined}
        {...rest}
      />
      {error && <span className="tw:text-danger">{error}</span>}
    </div>
  );
};
