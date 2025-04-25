import { Button, LabelledRevealablePasswordInput } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import type { useFetcher } from 'react-router';
import { CHANGE_PASSWORD_ACTION } from '../../users/user-profile-actions';
import type { changePasswordAction } from './change-password-action.server';

const formAction = `?${new URLSearchParams({ action: CHANGE_PASSWORD_ACTION }).toString()}`;

export type ChangePasswordFormProps = {
  fetcher: ReturnType<typeof useFetcher<typeof changePasswordAction>>;
};

export const ChangePasswordForm: FC<ChangePasswordFormProps> = ({ fetcher }) => {
  const { Form: ChangePasswordForm, ...changePasswordFetcher } = fetcher;
  const savingPassword = changePasswordFetcher.state === 'submitting';

  return (
    <ChangePasswordForm method="post" action={formAction} className="tw:flex tw:flex-col tw:gap-y-4">
      <LabelledRevealablePasswordInput label="Current password" required name="currentPassword" />
      <LabelledRevealablePasswordInput
        label="New password"
        name="newPassword"
        required
        minLength={8}
        error={
          changePasswordFetcher.data?.invalidFields?.includes('newPassword')
            ? 'Passwords must be at least 8-characters long and include a lowercase, an uppercase, a number and a special character'
            : undefined
        }
      />
      <LabelledRevealablePasswordInput
        label="Repeat password"
        name="repeatPassword"
        required
        minLength={8}
        error={
          changePasswordFetcher.data?.invalidFields?.includes('repeatPassword')
            ? 'Passwords must be at least 8-characters long and include a lowercase, an uppercase, a number and a special character'
            : undefined
        }
      />
      <div className="tw:flex tw:justify-end">
        <Button type="submit" className="tw:max-lg:w-full" disabled={savingPassword}>
          {savingPassword ? 'Saving...' : 'Save password'}
        </Button>
      </div>
    </ChangePasswordForm>
  );
};
