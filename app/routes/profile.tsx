import { Button, LabelledInput, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import { useCallback, useRef } from 'react';
import type { ActionFunctionArgs, unstable_RouterContextProvider } from 'react-router';
import { useFetcher } from 'react-router';
import { useSession } from '../auth/session-context';
import { Layout } from '../common/Layout';
import { serverContainer } from '../container/container.server';
import { authMiddleware, sessionContext } from '../middleware/middleware.server';
import { CHANGE_PASSWORD_ACTION, PROFILE_ACTION } from '../users/user-profile-actions';
import { UsersService } from '../users/UsersService.server';
import { ValidationError } from '../validation/ValidationError.server';

export const unstable_middleware = [authMiddleware];

export async function action(
  { request, context }: ActionFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const sessionData = (context as unstable_RouterContextProvider).get(sessionContext);
  const formData = await request.formData();

  try {
    await usersService.editUserProfile(sessionData.publicId, formData);
    return { ok: true };
  } catch (e: any) {
    if (e instanceof ValidationError) {
      return { of: false, error: e.name, invalidFields: Object.keys(e.invalidFields) };
    }

    return { of: false, error: e.name };
  }
}

export default function Profile() {
  const sessionData = useSession();

  const { Form: EditProfileForm, ...editProfileFetcher } = useFetcher<typeof action>();
  const savingProfile = editProfileFetcher.state === 'submitting';

  const { Form: ChangePasswordForm, ...changePasswordFetcher } = useFetcher<typeof action>();
  const savingPassword = changePasswordFetcher.state === 'submitting';
  const changePasswordFormRef = useRef<HTMLFormElement>(null);
  const resetPasswordForm = useCallback(() => changePasswordFormRef.current?.reset(), []);

  return (
    <Layout className="tw:flex tw:max-lg:flex-col tw:gap-4">
      <SimpleCard title="Edit profile" className="tw:flex-1">
        <EditProfileForm method="post" className="tw:flex tw:flex-col tw:gap-y-4">
          <input type="hidden" name="action" value={PROFILE_ACTION} />
          <LabelledInput label="Display name" defaultValue={sessionData?.displayName ?? ''} name="displayName" />
          <div className="tw:flex tw:justify-end">
            <Button type="submit" className="tw:max-lg:w-full" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </EditProfileForm>
      </SimpleCard>
      <SimpleCard title="Change password" className="tw:flex-1">
        <ChangePasswordForm method="post" className="tw:flex tw:flex-col tw:gap-y-4" ref={changePasswordFormRef}>
          <input type="hidden" name="action" value={CHANGE_PASSWORD_ACTION} />
          <LabelledInput label="Current password" type="password" required name="currentPassword" />
          <LabelledInput
            label="New password"
            type="password"
            name="newPassword"
            required
            minLength={8}
            error={
              changePasswordFetcher.data?.invalidFields?.includes('newPassword')
                ? 'Passwords must be at least 8-characters long and include a lowercase, an uppercase, a number and a special character'
                : undefined
            }
          />
          <LabelledInput
            label="Repeat password"
            type="password"
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
      </SimpleCard>
    </Layout>
  );
}
