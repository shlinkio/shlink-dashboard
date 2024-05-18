import Bottle from 'bottlejs';
import { Authenticator } from 'remix-auth';
import { apiClientBuilder } from '../api/apiClientBuilder.server';
import { createAuthenticator } from '../auth/auth.server';
import { createSessionStorage } from '../auth/session.server';
import { appDataSource } from '../db/data-source.server';
import { createServersRepository } from '../servers/ServersRepository.server';
import { ServersService } from '../servers/ServersService.server';
import { SettingsService } from '../settings/SettingsService.server';
import { TagsService } from '../tags/TagsService.server';
import { UsersService } from '../users/UsersService.server';

const bottle = new Bottle();

bottle.serviceFactory('em', () => appDataSource.manager);

bottle.serviceFactory('ServersRepository', createServersRepository, 'em');

bottle.service(ServersService.name, ServersService, 'ServersRepository');
bottle.service(TagsService.name, TagsService, 'em', ServersService.name);
bottle.service(SettingsService.name, SettingsService, 'em');
bottle.service(UsersService.name, UsersService, 'em');

bottle.constant('apiClientBuilder', apiClientBuilder);
bottle.serviceFactory('sessionStorage', createSessionStorage);
bottle.serviceFactory(Authenticator.name, createAuthenticator, UsersService.name, 'sessionStorage');

export const { container: serverContainer } = bottle;
