import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { useFetcher } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { Button } from '../../fe-kit/Button';
import { LabelledInput } from '../../fe-kit/LabelledInput';
import { LabelledSelect } from '../../fe-kit/LabelledSelect';
import { SimpleCard } from '../../fe-kit/SimpleCard';
import { UsersService } from '../../users/UsersService.server';
import { DuplicatedEntryError } from '../../validation/DuplicatedEntryError.server';
import { ValidationError } from '../../validation/ValidationError.server';
import { ensureAdmin } from './utils';

const roles = ['managed-user', 'advanced-user', 'admin'];

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
  const { Form, ...fetcher } = useFetcher<ActionResult>();
  const isSubmitting = fetcher.state === 'submitting';

  return (
    <Layout>
      {fetcher.data?.status === 'success' && (
        <SimpleCard title="User created" bodyClassName="tw:flex tw:flex-col tw:gap-y-4" data-testid="success-message">
          <p className="tw:m-0">User <b>{fetcher.data.user.username}</b> properly created.</p>
          <p className="tw:m-0">
            Their temporary password is <b>{fetcher.data.plainTextPassword}</b>. The user will have to change it the
            first time they log in.
          </p>
          <div>
            <Button inline to="/manage-users/1"><FontAwesomeIcon icon={faArrowLeft} /> Manage users</Button>
          </div>
        </SimpleCard>
      )}
      {fetcher.data?.status !== 'success' && (
        <Form method="post" className="tw:flex tw:flex-col tw:gap-y-4">
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
        </Form>
      )}
    </Layout>
  );
};
