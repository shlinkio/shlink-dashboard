import { LabelledRevealablePasswordInput } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import type { useFetcher } from 'react-router';
import { ChangePasswordFields } from '../../users/components/ChangePasswordFields';
import { CHANGE_PASSWORD_ACTION } from '../../users/user-profile-actions';
import type { changePasswordAction } from './change-password-action.server';
import { ProfileForm } from './ProfileForm';

export type ChangePasswordFormProps = {
  fetcher: ReturnType<typeof useFetcher<typeof changePasswordAction>>;
};

export const ChangePasswordForm: FC<ChangePasswordFormProps> = ({ fetcher }) => (
  <ProfileForm fetcher={fetcher} action={CHANGE_PASSWORD_ACTION}>
    <LabelledRevealablePasswordInput
      label="Current password"
      required
      name="currentPassword"
      error={fetcher.data?.invalidFields?.currentPassword}
    />
    <ChangePasswordFields
      newPasswordError={fetcher.data?.invalidFields?.newPassword}
      repeatPasswordError={fetcher.data?.invalidFields?.repeatPassword}
    />
  </ProfileForm>
);
