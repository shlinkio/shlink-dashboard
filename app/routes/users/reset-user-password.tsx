import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, SimpleCard,useGoBack  } from '@shlinkio/shlink-frontend-kit';
import { useCallback } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { useFetcher, useLoaderData } from 'react-router';
import { CopyToClipboard } from '../../common/CopyToClipboard';
import { serverContainer } from '../../container/container.server';
import { UsersService } from '../../users/UsersService.server';

export async function loader(
  { params }: LoaderFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const { userPublicId } = params;
  const user = await usersService.getUserById(userPublicId!);

  return { user };
}

export async function action(
  { params }: ActionFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const { userPublicId } = params;
  const [user, plainTextPassword] = await usersService.resetUserPassword(userPublicId!);

  return { user, plainTextPassword };
}

export default function ResetUserPassword() {
  const goBak = useGoBack();
  const { user } = useLoaderData<typeof loader>();
  const { state, data, submit } = useFetcher<typeof action>();
  const submitting = state === 'submitting';
  const resetPassword = useCallback(() => submit({}, { method: 'POST' }), [submit]);
  const username = data?.user.username ?? user.username;

  return (
    <SimpleCard title={`Reset "${username}" password`} bodyClassName="flex flex-col gap-y-4">
      {!data ? (
        <>
          <p className="font-bold"><span className="text-danger">Caution!</span> This action cannot be undone.</p>
          <p>Are you sure you want to reset <b>{user.username}</b> password?</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={submitting} onClick={goBak}>Cancel</Button>
            <Button variant="danger" solid disabled={submitting} onClick={resetPassword}>
              {submitting ? 'Resetting...' : 'Reset password'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p>Password for <b>{username}</b> properly reset.</p>
          <p>
            Their new temporary password
            is <CopyToClipboard text={data.plainTextPassword}>
              <b>{data.plainTextPassword}</b>
            </CopyToClipboard>. The user will have to change it the first time they log in.
          </p>
          <div>
            <Button inline to="/manage-users/1"><FontAwesomeIcon icon={faArrowLeft} /> Manage users</Button>
          </div>
        </>
      )}
    </SimpleCard>
  );
}
