import type { Settings } from '@shlinkio/shlink-web-component/settings';
import type { EntityManager } from 'typeorm';
import { SettingsEntity } from '../entities/Settings';
import { UserEntity } from '../entities/User';

export class SettingsService {
  constructor(private readonly em: EntityManager) {}

  async userSettings(userId: number): Promise<Settings> {
    const user = await this.em.findOneBy(UserEntity, { id: userId });
    if (!user) {
      return {};
    }

    const s = await this.em.findOneBy(SettingsEntity, { user });
    return s?.settings ?? {};
  }

  async saveUserSettings(userId: number, newSettings: Settings): Promise<void> {
    const user = await this.em.findOneBy(UserEntity, { id: userId });
    if (!user) {
      return;
    }

    await this.em.upsert(SettingsEntity, { user, settings: newSettings }, ['user']);
  }
}
