import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { useFetcher } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { UsersService } from '../../users/UsersService.server';
import { DuplicatedEntryError } from '../../validation/DuplicatedEntryError.server';
import { ValidationError } from '../../validation/ValidationError.server';
import { UserFormFields } from './UserFormFields';
import { ensureAdmin } from './utils';

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  await ensureAdmin(request, authHelper);
}

export async function action(
  { request }: ActionFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  await ensureAdmin(request, authHelper);

  const formData = await request.formData();
  try {
    const [user, plainTextPassword] = await usersService.createUser(formData);
    return { status: 'success', user, plainTextPassword } as const;
  } catch (e) {
    const messages: Record<string, string> = {};

    if (e instanceof DuplicatedEntryError) {
      messages.username = 'Username is already in use.';
    } else if (e instanceof ValidationError && e.invalidFields.username) {
      messages.username = 'Username can only contain letters and numbers. Underscore (_) and dot (.) can also be used anywhere except at the beginning or end.';
    }

    return { status: 'error', messages } as const;
  }
}

export type ActionResult = Awaited<ReturnType<typeof action>>;

export default function CreateUser() {
  const { Form, state, data } = useFetcher<ActionResult>();
  const isSubmitting = state === 'submitting';

  return (
    <Layout>
      {data?.status === 'success' && (
        <SimpleCard title="User created" bodyClassName="tw:flex tw:flex-col tw:gap-y-4" data-testid="success-message">
          <p className="tw:m-0">User <b>{data.user.username}</b> properly created.</p>
          <p className="tw:m-0">
            Their temporary password is <b>{data.plainTextPassword}</b>. The user will have to change it the
            first time they log in.
          </p>
          <div>
            <Button inline to="/manage-users/1"><FontAwesomeIcon icon={faArrowLeft} /> Manage users</Button>
          </div>
        </SimpleCard>
      )}
      {data?.status !== 'success' && (
        <Form method="post">
          <UserFormFields
            title="Add new user"
            disabled={isSubmitting}
            usernameError={data?.status === 'error' ? data?.messages.username : undefined}
            submitText={isSubmitting ? 'Saving...' : 'Create user'}
          />
        </Form>
      )}
    </Layout>
  );
};
