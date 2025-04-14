import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { ActionFunctionArgs } from 'react-router';
import { useFetcher } from 'react-router';
import { CopyToClipboard } from '../../common/CopyToClipboard';
import { serverContainer } from '../../container/container.server';
import { UsersService } from '../../users/UsersService.server';
import { DuplicatedEntryError } from '../../validation/DuplicatedEntryError.server';
import { ValidationError } from '../../validation/ValidationError.server';
import { UserFormFields } from './UserFormFields';

export async function action(
  { request }: ActionFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
) {
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

export default function CreateUser() {
  const { Form, state, data } = useFetcher<typeof action>();
  const isSubmitting = state === 'submitting';

  return (
    <>
      {data?.status === 'success' && (
        <SimpleCard title="User created" bodyClassName="tw:flex tw:flex-col tw:gap-y-4" data-testid="success-message">
          <p>User <b>{data.user.username}</b> properly created.</p>
          <p>
            Their temporary password
            is <CopyToClipboard text={data.plainTextPassword}><b>{data.plainTextPassword}</b></CopyToClipboard>. The
            user will have to change it the first time they log in.
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
    </>
  );
};
