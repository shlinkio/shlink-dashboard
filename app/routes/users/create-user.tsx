import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { useFetcher } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { Button } from '../../fe-kit/Button';
import { LabelledInput } from '../../fe-kit/LabelledInput';
import { LabelledSelect } from '../../fe-kit/LabelledSelect';
import { UsersService } from '../../users/UsersService.server';

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

export async function action(
  { request }: ActionFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const formData = await request.formData();
  const [user, plainTextPassword] = await usersService.createUser(formData);

  return { user, plainTextPassword };
}

type ActionResult = Awaited<ReturnType<typeof action>>;

export default function CreateUser() {
  const fetcher = useFetcher<ActionResult>();
  const isSubmitting = fetcher.state === 'submitting';

  return (
    <Layout>
      {fetcher.data && (
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
      {!fetcher.data && (
        <fetcher.Form method="post" className="tw:flex tw:flex-col tw:gap-y-4">
          <SimpleCard title="Add new user" bodyClassName="tw:flex tw:flex-col tw:gap-y-4">
            <LabelledInput label="Username" name="username" required disabled={isSubmitting} />
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
