import type { FC } from 'react';
import { useId } from 'react';
import { Label } from './Label';
import type { SelectProps } from './Select';
import { Select } from './Select';

export type LabelledSelectProps = Omit<SelectProps, 'className' | 'id'> & {
  label: string;
  selectClassName?: string;

  /** Alternative to `required`. Causes the input to be required, without displaying an asterisk */
  hiddenRequired?: boolean;
};

export const LabelledSelect: FC<LabelledSelectProps> = (
  { selectClassName, label, required, hiddenRequired, ...rest },
) => {
  const id = useId();
  return (
    <div className="tw:flex tw:flex-col tw:gap-1">
      <Label htmlFor={id} required={required}>{label}</Label>
      <Select id={id} className={selectClassName} required={required || hiddenRequired} {...rest} />
    </div>
  );
};
