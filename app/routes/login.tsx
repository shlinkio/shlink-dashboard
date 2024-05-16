import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
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
  return authenticator.authenticate(CREDENTIALS_STRATEGY, request, {
    successRedirect: searchParams.get('redirect-to') ?? '/', // TODO Make sure "redirect-to" is a relative URL
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
    <form
      method="post"
      className="d-flex flex-column gap-3 p-3 mt-5 mx-auto w-50 rounded-2 border-opacity-25 border-secondary"
      style={{ borderWidth: '1px', borderStyle: 'solid' }}
    >
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
  );
}
