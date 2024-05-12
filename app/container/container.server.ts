import Bottle from 'bottlejs';
import { apiClientBuilder } from '../api/apiClientBuilder.server';
import { appDataSource } from '../db/data-source.server';
import { ServersService } from '../servers/ServersService.server';
import { SettingsService } from '../settings/SettingsService.server';
import { TagsService } from '../tags/TagsService.server';

const bottle = new Bottle();

bottle.serviceFactory('em', () => appDataSource.manager);

bottle.service(TagsService.name, TagsService, 'em');
bottle.service(ServersService.name, ServersService, 'em');
bottle.service(SettingsService.name, SettingsService, 'em');

bottle.constant('apiClientBuilder', apiClientBuilder);

export const { container: serverContainer } = bottle;
