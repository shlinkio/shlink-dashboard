import { Migrator } from '@mikro-orm/migrations';
import { serverContainer } from '../app/container/container.server';

const migrator: Migrator = serverContainer[Migrator.name];
await migrator.up();

process.exit(0);
