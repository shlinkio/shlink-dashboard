import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect, useFetcher, useLoaderData } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { UsersService } from '../../users/UsersService.server';
import { UserFormFields } from './UserFormFields';
import { ensureAdmin } from './utils';

export async function loader(
  { request, params }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  usersService: UsersService = serverContainer[UsersService.name],
) {
  await ensureAdmin(request, authHelper);

  const { userId } = params;
  const user = await usersService.getUserById(userId!);

  return { user };
}

export async function action(
  { request, params }: ActionFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  await ensureAdmin(request, authHelper);

  const { userId } = params;
  const formData = await request.formData();

  // TODO Handle error while editing the user
  await usersService.editUser(userId!, formData);
  return redirect('/manage-users/1');
}

export type ActionResult = Awaited<ReturnType<typeof action>>;

export default function EditUser() {
  const { user } = useLoaderData<typeof loader>();
  const { Form, state } = useFetcher<ActionResult>();
  const isSubmitting = state === 'submitting';

  return (
    <Layout>
      <Form method="post">
        <UserFormFields
          user={user}
          disabled={isSubmitting}
          submitText={isSubmitting ? 'Saving...' : 'Update user'}
        />
      </Form>
    </Layout>
  );
}
