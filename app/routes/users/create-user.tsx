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

export default function CreateUser() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';

  return (
    <Layout>
      <fetcher.Form method="post" className="tw:flex tw:flex-col tw:gap-y-4">
        <SimpleCard title="Add new user" bodyClassName="tw:flex tw:flex-col tw:gap-y-4">
          <LabelledInput label="Username" name="username" required disabled={isSubmitting} />
          <LabelledInput label="Display name" name="displayName" disabled={isSubmitting} />
          <LabelledSelect label="Role" name="role" required disabled={isSubmitting}>
            {roles.map((role) => <option value={role} key={role}>{role.replace('-', ' ')}</option>)}
          </LabelledSelect>
        </SimpleCard>
        <div className="tw:flex tw:flex-row-reverse tw:gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create user'}
          </Button>
          <Button variant="secondary" to="/manage-users/1">Cancel</Button>
        </div>
      </fetcher.Form>
    </Layout>
  );
};
