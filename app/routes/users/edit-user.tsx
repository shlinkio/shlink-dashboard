import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect, useFetcher, useLoaderData } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { UsersService } from '../../users/UsersService.server';
import { notFound } from '../../utils/response.server';
import { NotFoundError } from '../../validation/NotFoundError.server';
import { UserFormFields } from './UserFormFields';
import { ensureAdmin } from './utils.server';

export async function loader(
  { request, params }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  usersService: UsersService = serverContainer[UsersService.name],
) {
  await ensureAdmin(request, authHelper);

  const { userId } = params;

  try {
    const user = await usersService.getUserById(userId!);
    return { user };
  } catch (e) {
    if (e instanceof NotFoundError) {
      throw notFound();
    }

    throw e;
  }
}

export async function action(
  { request, params }: ActionFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  usersService: UsersService = serverContainer[UsersService.name],
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
          title="Edit user"
          user={user}
          disabled={isSubmitting}
          submitText={isSubmitting ? 'Saving...' : 'Update user'}
        />
      </Form>
    </Layout>
  );
}
