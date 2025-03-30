import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect , useFetcher } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { ServersService } from '../../servers/ServersService.server';
import { ensureNotManaged } from '../users/utils.server';
import { ServerFormFields } from './ServerFormFields';

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  await ensureNotManaged(request, authHelper);
}

export async function action(
  { request }: ActionFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  serversService: ServersService = serverContainer[ServersService.name],
) {
  const [session, formData] = await Promise.all([
    ensureNotManaged(request, authHelper),
    request.formData(),
  ]);

  // TODO Handle error when creating a server
  await serversService.createServerForUser(session.userId, formData);
  return redirect('/manage-servers/1');
}

export default function CreateServer() {
  const { Form, state } = useFetcher();
  const isSaving = state !== 'idle';

  return (
    <Layout>
      <Form method="post">
        <ServerFormFields
          title="Add new server"
          submitText={isSaving ? 'Saving...' : 'Create server'}
          disabled={isSaving}
        />
      </Form>
    </Layout>
  );
}
