import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { appDataSource } from '../db/data-source.server';
import { ServerEntity } from '../entities/Server';
import { TagEntity } from '../entities/Tag';
import { UserEntity } from '../entities/User';

export async function action({ params, request }: ActionFunctionArgs) {
  const { serverId } = params;
  const [user, server] = await Promise.all([
    // TODO Get UserID from session
    appDataSource.manager.findOneBy(UserEntity, { id: 1 }),
    // TODO Check user in session has access to server in route
    appDataSource.manager.findOneBy(ServerEntity, { publicId: serverId }),
  ]);

  if (!user || !server) {
    // TODO Return a useful response
    throw new Error('Server or user not found');
  }

  const colors = await request.json();
  // FIXME MS SQL Server does not support upsert
  await appDataSource.manager.transaction((em) => em.upsert(
    TagEntity,
    Object.entries(colors).map(([tag, color]) => ({
      tag,
      color: color as string,
      user,
      server,
    })),
    ['tag', 'user', 'server'],
  ));

  // TODO Return new colors
  return json({});
}
