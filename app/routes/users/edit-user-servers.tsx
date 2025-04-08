import { useGoBack } from '@shlinkio/shlink-frontend-kit';
import { Button, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import { useCallback, useMemo, useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect, useFetcher, useLoaderData } from 'react-router';
import { serverContainer } from '../../container/container.server';
import { ServersService } from '../../servers/ServersService.server';
import { UsersService } from '../../users/UsersService.server';
import { badRequest } from '../../utils/response.server';
import { UserServers } from './UserServers';

export async function loader(
  { params }: LoaderFunctionArgs,
  serversService: ServersService = serverContainer[ServersService.name],
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const { userId } = params;
  const [servers, user] = await Promise.all([
    serversService.getUserServers(userId!),
    usersService.getUserById(userId!),
  ]);

  if (user.role !== 'managed-user') {
    throw badRequest('Servers can be set only on managed users');
  }

  return { servers, user };
}

export async function action(
  { request, params }: ActionFunctionArgs,
  serversService: ServersService = serverContainer[ServersService.name],
) {
  const { userId } = params;
  const formData = await request.formData();

  // TODO Handle error while editing user servers
  await serversService.setServersForUser(userId!, formData);
  // TODO redirect back to the original page if known
  return redirect('/manage-users/1');
}

export default function EditUserServers() {
  const { servers, user } = useLoaderData<typeof loader>();

  const serversFetcher = useFetcher<typeof loader>();
  const [searching, setSearching] = useState(false);
  const searchServers = useCallback(async (searchTerm: string) => {
    setSearching(false);
    if (!searchTerm) {
      return;
    }

    const query = new URLSearchParams();
    query.set('search-term', searchTerm);
    query.set('no-users', '');
    query.set('items-per-page', '10'); // Limit to a maximum of 10 matching servers

    await serversFetcher.load(`/manage-servers?${query.toString()}`);
    setSearching(true);
  }, [serversFetcher]);
  const isSearching = serversFetcher.state === 'loading';
  const searchResults = useMemo(
    () => !searching ? undefined : serversFetcher.data?.servers,
    [searching, serversFetcher.data?.servers],
  );

  const goBack = useGoBack();
  const { Form } = useFetcher();

  return (
    <Form method="post" className="tw:flex tw:flex-col tw:gap-4">
      <SimpleCard title={`Shlink servers for "${user.username}"`}>
        <UserServers
          initialServers={servers}
          onSearch={searchServers}
          searchResults={searchResults}
          loading={isSearching}
        />
      </SimpleCard>
      <div className="tw:flex tw:justify-end tw:gap-2">
        <Button variant="secondary" onClick={goBack}>Cancel</Button>
        <Button type="submit">Save servers</Button>
      </div>
    </Form>
  );
}
