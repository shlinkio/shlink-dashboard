import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect, useFetcher } from 'react-router';
import { serverContainer } from '../../container/container.server';
import { UsersService } from '../../users/UsersService.server';
import { notFound } from '../../utils/response.server';
import { NotFoundError } from '../../validation/NotFoundError.server';
import type { RouteComponentProps } from '../types';
import type { Route } from './+types/edit-user';
import { UserFormFields } from './UserFormFields';

export async function loader(
  { params }: LoaderFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const { userPublicId } = params;

  try {
    const user = await usersService.getUserById(userPublicId!);
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
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const { userPublicId } = params;
  const formData = await request.formData();

  // TODO Handle error while editing the user
  await usersService.editUser(userPublicId!, formData);
  return redirect('/manage-users/1');
}

export default function EditUser({ loaderData }: RouteComponentProps<Route.ComponentProps>) {
  const { user } = loaderData;
  const { Form, state } = useFetcher<typeof action>();
  const isSubmitting = state === 'submitting';

  return (
    <Form method="post">
      <UserFormFields
        title="Edit user"
        user={user}
        disabled={isSubmitting}
        submitText={isSubmitting ? 'Saving...' : 'Update user'}
      />
    </Form>
  );
}
