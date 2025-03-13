import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { useId } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { useFetcher } from 'react-router';
import { redirect } from 'react-router';
import { AuthHelper } from '../auth/auth-helper.server';
import { serverContainer } from '../container/container.server';
import { Button } from '../fe-kit/Button';
import { Input } from '../fe-kit/Input';

const INCORRECT_CREDENTIAL_ERROR_PREFIXES = ['Incorrect password', 'User not found'];

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  // If the user is already authenticated, redirect to home
  const isAuthenticated = await authHelper.isAuthenticated(request);
  return isAuthenticated ? redirect('/') : {};
}

export async function action(
  { request }: ActionFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  try {
    return await authHelper.login(request);
  } catch (e: any) {
    // TODO Use a more robust way to detect errors
    if (INCORRECT_CREDENTIAL_ERROR_PREFIXES.some((prefix) => e.message.startsWith(prefix))) {
      return { error: true };
    }

    throw e;
  }
}

type ActionResult = Awaited<ReturnType<typeof action>>;

export default function Login() {
  const usernameId = useId();
  const passwordId = useId();
  const fetcher = useFetcher<ActionResult>();
  const isSaving = fetcher.state === 'submitting';

  return (
    <div className="tw:mt-8 tw:mx-8 tw:lg:mx-auto tw:lg:w-[50%]">
      <SimpleCard>
        <fetcher.Form method="post" className="tw:flex tw:flex-col tw:gap-4">
          <div>
            <label htmlFor={usernameId}>Username:</label>
            <Input id={usernameId} name="username" required />
          </div>
          <div>
            <label htmlFor={passwordId}>Password:</label>
            <Input id={passwordId} type="password" name="password" required />
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Logging in...' : 'Login'}
          </Button>
          {fetcher.data && 'error' in fetcher.data && fetcher.data.error && (
            <div className="text-danger">Username or password are incorrect</div>
          )}
        </fetcher.Form>
      </SimpleCard>
    </div>
  );
}
