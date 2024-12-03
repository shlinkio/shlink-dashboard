import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { useId } from 'react';
import { Button, Input } from 'reactstrap';
import { AuthHelper } from '../auth/auth-helper.server';
import { serverContainer } from '../container/container.server';

export async function action(
  { request }: ActionFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  try {
    return await authHelper.login(request);
  } catch (e: any) {
    // TODO Use a more robust way to detect errors
    if (e.message.startsWith('Incorrect password') || e.message.startsWith('User not found')) {
      return json({ error: true });
    }

    throw e;
  }
}

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  // If the user is already authenticated redirect to home
  const sessionData = await authHelper.getSession(request);
  if (sessionData) {
    return redirect('/');
  }

  return {};
}

export default function Login() {
  const usernameId = useId();
  const passwordId = useId();
  const actionData = useActionData<typeof action>();

  return (
    <div className="tw-mt-8 tw-mx-8 lg:tw-mx-auto lg:tw-w-[50%]">
      <SimpleCard>
        <form method="post" className="tw-flex tw-flex-col tw-gap-4">
          <div>
            <label htmlFor={usernameId}>Username:</label>
            <Input id={usernameId} name="username" required />
          </div>
          <div>
            <label htmlFor={passwordId}>Password:</label>
            <Input id={passwordId} type="password" name="password" required />
          </div>
          <Button color="primary" type="submit">Login</Button>
          {actionData?.error && (
            <div className="text-danger" data-testid="error-message">Username or password are incorrect</div>
          )}
        </form>
      </SimpleCard>
    </div>
  );
}
