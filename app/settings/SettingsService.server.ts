import type { Settings } from '@shlinkio/shlink-web-component';
import type { EntityManager } from 'typeorm';
import { SettingsEntity } from '../entities/Settings';
import { UserEntity } from '../entities/User';

export class SettingsService {
  constructor(private readonly em: EntityManager) {}

  async userSettings(userId: number): Promise<Settings> {
    const user = await this.em.findOneBy(UserEntity, { id: userId });
    if (!user) {
      throw new Error(`No user found for id ${userId}`);
    }

    const s = await this.em.findOneBy(SettingsEntity, { user });
    return s?.settings ?? {};
  }
}
