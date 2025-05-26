import { LabelledRevealablePasswordInput } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';

export type ChangePasswordFieldsProps = {
  newPasswordError?: string;
  repeatPasswordError?: string;
};

export const ChangePasswordFields: FC<ChangePasswordFieldsProps> = ({ newPasswordError, repeatPasswordError }) => (
  <>
    <LabelledRevealablePasswordInput
      label="New password"
      name="newPassword"
      required
      minLength={8}
      error={newPasswordError}
    />
    <LabelledRevealablePasswordInput
      label="Repeat password"
      name="repeatPassword"
      required
      minLength={8}
      error={repeatPasswordError}
    />
  </>
);
