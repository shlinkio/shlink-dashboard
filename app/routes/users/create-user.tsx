import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { useFetcher } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import type { User } from '../../entities/User';
import { Button } from '../../fe-kit/Button';
import { LabelledInput } from '../../fe-kit/LabelledInput';
import { LabelledSelect } from '../../fe-kit/LabelledSelect';
import { UsersService } from '../../users/UsersService.server';
import { DuplicatedEntryError } from '../../validation/DuplicatedEntryError.server';

const roles = ['managed-user', 'advanced-user', 'admin'];

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  const { role } = await authHelper.getSession(request, '/login');
  if (role !== 'admin') {
    throw new Response('Not found', { status: 404 });
  }
}

type ActionResult = {
  status: 'success';
  user: User;
  plainTextPassword: string;
} | {
  status: 'error';
  messages: Record<string, string>;
};

export async function action(
  { request }: ActionFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
): Promise<ActionResult> {
  const formData = await request.formData();
  try {
    const [user, plainTextPassword] = await usersService.createUser(formData);
    return { status: 'success', user, plainTextPassword };
  } catch (e) {
    const messages: Record<string, string> = {};
    if (e instanceof DuplicatedEntryError) {
      messages.username = 'Username already exists';
    }

    return { status: 'error', messages };
  }
}

export default function CreateUser() {
  const fetcher = useFetcher<ActionResult>();
  const isSubmitting = fetcher.state === 'submitting';

  return (
    <Layout>
      {fetcher.data?.status === 'success' && (
        <SimpleCard title="User created" bodyClassName="tw:flex tw:flex-col tw:gap-y-4">
          <p className="tw:m-0!">User <b>{fetcher.data.user.username}</b> properly created.</p>
          <p className="tw:m-0!">
            Their temporary password is <b>{fetcher.data.plainTextPassword}</b>. The user will have to change it the
            first time they log in.
          </p>
          <div>
            <Button inline to="/manage-users/1"><FontAwesomeIcon icon={faArrowLeft} /> Manage users</Button>
          </div>
        </SimpleCard>
      )}
      {fetcher.data?.status !== 'success' && (
        <fetcher.Form method="post" className="tw:flex tw:flex-col tw:gap-y-4">
          <SimpleCard title="Add new user" bodyClassName="tw:flex tw:flex-col tw:gap-y-4">
            <LabelledInput
              label="Username"
              name="username"
              required
              disabled={isSubmitting}
              error={fetcher.data?.status === 'error' ? fetcher.data?.messages.username : undefined}
            />
            <LabelledInput label="Display name" name="displayName" disabled={isSubmitting} />
            <LabelledSelect label="Role" name="role" required disabled={isSubmitting}>
              {roles.map((role) => <option value={role} key={role}>{role.replaceAll('-', ' ')}</option>)}
            </LabelledSelect>
          </SimpleCard>
          <div className="tw:flex tw:flex-row-reverse tw:gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Create user'}
            </Button>
            <Button variant="secondary" to="/manage-users/1">Cancel</Button>
          </div>
        </fetcher.Form>
      )}
    </Layout>
  );
};
