import { Migrator } from '@mikro-orm/migrations';
import Bottle from 'bottlejs';
import { Authenticator } from 'remix-auth';
import { apiClientBuilder } from '../api/apiClientBuilder.server';
import { createAuthenticator } from '../auth/auth.server';
import { AuthHelper } from '../auth/auth-helper.server';
import { createSessionStorage } from '../auth/session.server';
import { createEntityManager, createEntityManagerForkingMiddleware, createMigrator, createORM } from '../db/db.server';
import { createServersRepository } from '../servers/ServersRepository.server';
import { ServersService } from '../servers/ServersService.server';
import { SettingsService } from '../settings/SettingsService.server';
import { TagsService } from '../tags/TagsService.server';
import { UsersService } from '../users/UsersService.server';

const bottle = new Bottle();

bottle.serviceFactory('orm', createORM);
bottle.serviceFactory(Migrator.name, createMigrator, 'orm');
bottle.serviceFactory('em', createEntityManager, 'orm');
bottle.serviceFactory('emForkMiddleware', createEntityManagerForkingMiddleware, 'em');

bottle.serviceFactory('ServersRepository', createServersRepository, 'em');

bottle.service(ServersService.name, ServersService, 'ServersRepository');
bottle.service(TagsService.name, TagsService, 'em', ServersService.name);
bottle.service(SettingsService.name, SettingsService, 'em');
bottle.service(UsersService.name, UsersService, 'em');

bottle.constant('apiClientBuilder', apiClientBuilder);
bottle.serviceFactory('sessionStorage', createSessionStorage);
bottle.serviceFactory(Authenticator.name, createAuthenticator, UsersService.name);
bottle.service(AuthHelper.name, AuthHelper, Authenticator.name, 'sessionStorage');

export const { container: serverContainer } = bottle;
