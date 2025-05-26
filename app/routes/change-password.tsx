import { Button, Card } from '@shlinkio/shlink-frontend-kit/tailwind';
import { type ActionFunctionArgs, data, redirect, useFetcher } from 'react-router';
import { AuthHelper } from '../auth/auth-helper.server';
import { Layout } from '../common/Layout';
import { serverContainer } from '../container/container.server';
import { authMiddleware, sessionContext } from '../middleware/middleware.server';
import { ChangePasswordFields } from '../users/components/ChangePasswordFields';
import { PasswordMismatchError } from '../users/PasswordMismatchError.server';
import { UsersService } from '../users/UsersService.server';
import { ValidationError } from '../validation/ValidationError.server';
import { INVALID_PASSWORD_FORMAT } from './profile/change-password-action.server';

export const unstable_middleware = [authMiddleware];

export async function loader({ context }: ActionFunctionArgs) {
  const sessionData = context.get(sessionContext);
  if (!sessionData.tempPassword) {
    return redirect('/');
  }
}

export async function action(
  { request, context }: ActionFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
): Promise<ReturnType<typeof data<{ ok: true }>> | { ok: false; error: string }> {
  const sessionData = context.get(sessionContext);
  const formData = await request.formData();

  try {
    await usersService.editUserTempPassword(sessionData.publicId, formData);
    const sessionCookie = await authHelper.updateSession(request, { tempPassword: false });

    return data(
      { ok: true },
      sessionCookie ? {
        headers: { 'Set-Cookie': sessionCookie },
      } : undefined,
    );
  } catch (e) {
    if (e instanceof ValidationError) {
      return { ok: false, error: INVALID_PASSWORD_FORMAT };
    } else if (e instanceof PasswordMismatchError) {
      return { ok: false, error: e.message };
    }

    throw e;
  }
}

export default function ChangePassword() {
  const { Form, data } = useFetcher<typeof action>();

  return (
    <Layout>
      <Card>
        <Form method="post">
          <Card.Header>
            <h5>Set your password</h5>
          </Card.Header>
          <Card.Body className="tw:flex tw:flex-col tw:gap-y-4">
            <div>
              <p>You need to change your temporary password before going forward.</p>
              <p>
                You password must be at least 8-characters long and include a lowercase, an uppercase, a number and a
                special character.
              </p>
            </div>
            <ChangePasswordFields />
            {(data && !data.ok) && (
              <div className="tw:text-danger">
                {data.error}
              </div>
            )}
          </Card.Body>
          <Card.Footer className="tw:flex tw:justify-end">
            <Button type="submit">Save</Button>
          </Card.Footer>
        </Form>
      </Card>
    </Layout>
  );
}
