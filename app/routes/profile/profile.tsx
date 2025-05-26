import { SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { ActionFunctionArgs } from 'react-router';
import { data , useFetcher } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { useSession } from '../../auth/session-context';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { authMiddleware, sessionContext } from '../../middleware/middleware.server';
import { CHANGE_PASSWORD_ACTION, PROFILE_ACTION } from '../../users/user-profile-actions';
import { UsersService } from '../../users/UsersService.server';
import { requestQueryParam } from '../../utils/request.server';
import { changePasswordAction } from './change-password-action.server';
import { ChangePasswordForm } from './ChangePasswordForm';
import { editProfileAction } from './edit-profile-action.server';
import { EditProfileForm } from './EditProfileForm';

export const unstable_middleware = [authMiddleware];

export async function action(
  { request, context }: ActionFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  const sessionData = context.get(sessionContext);
  const action = requestQueryParam(request, 'action');
  const formData = await request.formData();

  switch (action) {
    case PROFILE_ACTION: {
      const { user, ...payload } = await editProfileAction(sessionData.publicId, formData, usersService);
      const sessionCookie = await authHelper.updateSession(request, { displayName: user.displayName });

      return data(
        payload,
        sessionCookie ? {
          headers: { 'Set-Cookie': sessionCookie },
        } : undefined,
      );
    }
    case CHANGE_PASSWORD_ACTION:
      return changePasswordAction(sessionData.publicId, formData, usersService);
  }
}

export default function Profile() {
  const sessionData = useSession();
  const profileFetcher = useFetcher<typeof editProfileAction>();
  const changePasswordFetcher = useFetcher<typeof changePasswordAction>();

  return (
    <Layout className="tw:flex tw:max-lg:flex-col tw:gap-4">
      <SimpleCard title="Edit profile" className="tw:flex-1">
        <EditProfileForm fetcher={profileFetcher} sessionData={sessionData} />
      </SimpleCard>
      <SimpleCard title="Change password" className="tw:flex-1">
        <ChangePasswordForm fetcher={changePasswordFetcher} />
      </SimpleCard>
    </Layout>
  );
}
