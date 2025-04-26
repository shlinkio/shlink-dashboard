import { LabelledRevealablePasswordInput } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import type { useFetcher } from 'react-router';
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
    <LabelledRevealablePasswordInput
      label="New password"
      name="newPassword"
      required
      minLength={8}
      error={fetcher.data?.invalidFields?.newPassword}
    />
    <LabelledRevealablePasswordInput
      label="Repeat password"
      name="repeatPassword"
      required
      minLength={8}
      error={fetcher.data?.invalidFields?.repeatPassword}
    />
  </ProfileForm>
);
