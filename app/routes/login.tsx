import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { useId } from 'react';
import { Button, Input } from 'reactstrap';
import { Authenticator } from 'remix-auth';
import { CREDENTIALS_STRATEGY } from '../auth/auth.server';
import type { SessionStorage } from '../auth/session.server';
import { serverContainer } from '../container/container.server';

export async function action(
  { request }: ActionFunctionArgs,
  authenticator: Authenticator = serverContainer[Authenticator.name],
) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirect-to');
  const successRedirect = redirectTo && !redirectTo.toLowerCase().startsWith('http') ? redirectTo : '/';

  return authenticator.authenticate(CREDENTIALS_STRATEGY, request, {
    successRedirect,
    failureRedirect: request.url,
  });
}

export async function loader(
  { request }: LoaderFunctionArgs,
  authenticator: Authenticator = serverContainer[Authenticator.name],
  { getSession, commitSession }: SessionStorage = serverContainer.sessionStorage,
) {
  // If the user is already authenticated redirect to home
  await authenticator.isAuthenticated(request, { successRedirect: '/' });

  const session = await getSession(request.headers.get('cookie'));
  const error = session.get(authenticator.sessionErrorKey);
  return json({ error }, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export default function Login() {
  const usernameId = useId();
  const passwordId = useId();
  const { error } = useLoaderData<typeof loader>();

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
          {!!error && <div className="text-danger" data-testid="error-message">Username or password are incorrect</div>}
        </form>
      </SimpleCard>
    </div>
  );
}
