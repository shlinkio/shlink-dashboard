import type { ActionFunctionArgs, LoaderFunctionArgs, unstable_RouterContextProvider } from 'react-router';
import { redirect , useFetcher,useLoaderData  } from 'react-router';
import { serverContainer } from '../../container/container.server';
import { sessionContext } from '../../middleware/middleware.server';
import { ServersService } from '../../servers/ServersService.server';
import { notFound } from '../../utils/response.server';
import { NotFoundError } from '../../validation/NotFoundError.server';
import { ServerFormFields } from './ServerFormFields';

export async function loader(
  { params, context }: LoaderFunctionArgs,
  serversService: ServersService = serverContainer[ServersService.name],
) {
  const sessionData = (context as unstable_RouterContextProvider).get(sessionContext);
  const { serverPublicId } = params;

  try {
    const server = await serversService.getByPublicIdAndUser(serverPublicId!, sessionData.publicId);
    return { server };
  } catch (e) {
    if (e instanceof NotFoundError) {
      throw notFound();
    }

    throw e;
  }
}

export async function action(
  { request, params, context }: ActionFunctionArgs,
  serversService: ServersService = serverContainer[ServersService.name],
) {
  const sessionData = (context as unstable_RouterContextProvider).get(sessionContext);
  const { serverPublicId } = params;
  const formData = await request.formData();

  // TODO Handle errors while editing the server
  await serversService.editServerForUser(sessionData.publicId, serverPublicId!, formData);
  return redirect('/manage-servers/1');
}

export default function EditServer() {
  const { server } = useLoaderData<typeof loader>();
  const { Form, state } = useFetcher();
  const isSaving = state !== 'idle';

  return (
    <Form method="post">
      <ServerFormFields
        title={`Edit server "${server.name}"`}
        submitText={isSaving ? 'Saving...' : 'Save'}
        disabled={isSaving}
        server={server}
      />
    </Form>
  );
}
