import type { Options } from '@mikro-orm/core';
import { Server } from './app/entities/Server';
import { Settings } from './app/entities/Settings';
import { Tag } from './app/entities/Tag';
import { User } from './app/entities/User';
import { isProd } from './app/utils/env.server';
import baseConfig from './migrations.config';

const isProduction = isProd();

async function resolveOptions(): Promise<Options> {
  return {
    ...baseConfig,
    entities: [User, Settings, Server, Tag],
    debug: !isProduction,
  } satisfies Options;
}

export default await resolveOptions();
