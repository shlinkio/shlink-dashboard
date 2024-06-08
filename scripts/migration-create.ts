import { Migrator } from '@mikro-orm/migrations';
import { serverContainer } from '../app/container/container.server';

const migrator: Migrator = serverContainer[Migrator.name];
await migrator.createMigration(undefined, true); // Blank migration

process.exit(0);
