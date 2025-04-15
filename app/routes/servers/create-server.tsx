import type { ActionFunctionArgs, unstable_RouterContextProvider } from 'react-router';
import { redirect, useFetcher } from 'react-router';
import { serverContainer } from '../../container/container.server';
import { sessionContext } from '../../middleware/middleware.server';
import { ServersService } from '../../servers/ServersService.server';
import { ServerFormFields } from './ServerFormFields';

export async function action(
  { request, context }: ActionFunctionArgs,
  serversService: ServersService = serverContainer[ServersService.name],
) {
  const session = (context as unstable_RouterContextProvider).get(sessionContext);
  const formData = await  request.formData();

  // TODO Handle error when creating a server
  await serversService.createServerForUser(session.publicId, formData);
  return redirect('/manage-servers/1');
}

export default function CreateServer() {
  const { Form, state } = useFetcher();
  const isSaving = state !== 'idle';

  return (
    <Form method="post">
      <ServerFormFields
        title="Add new server"
        submitText={isSaving ? 'Saving...' : 'Create server'}
        disabled={isSaving}
      />
    </Form>
  );
}
