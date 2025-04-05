import { Button, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import { useCallback, useMemo, useState } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { useFetcher , useLoaderData,useNavigate  } from 'react-router';
import { serverContainer } from '../../container/container.server';
import { ServersService } from '../../servers/ServersService.server';
import { UsersService } from '../../users/UsersService.server';
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
    // TODO Throw 400 error here
  }

  return { servers, user };
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
    const queryString = query.size > 0 ? `?${query.toString()}` : '';

    await serversFetcher.load(`/manage-servers${queryString}`);
    setSearching(true);
  }, [serversFetcher]);
  const searchResults = useMemo(() => {
    if (!searching) {
      return undefined;
    }
    return serversFetcher.data?.servers.slice(0, 10);
  }, [searching, serversFetcher.data?.servers]);

  const navigate = useNavigate();
  const goBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <>
      <SimpleCard title={`Shlink servers for "${user.username}"`}>
        <UserServers initialServers={servers} onSearch={searchServers} searchResults={searchResults} />
      </SimpleCard>
      <div className="tw:flex tw:justify-end tw:gap-2">
        <Button variant="secondary" onClick={goBack}>Cancel</Button>
        <Button type="submit">Save servers</Button>
      </div>
    </>
  );
}
