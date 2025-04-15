import type { EntityManager } from '@mikro-orm/core';
import type { Settings } from '@shlinkio/shlink-web-component/settings';
import { Settings as SettingsEntity } from '../entities/Settings';
import { User } from '../entities/User';

export class SettingsService {
  readonly #em: EntityManager;

  constructor(em: EntityManager) {
    this.#em = em;
  }

  async userSettings(publicId: string): Promise<Settings> {
    const user = await this.#em.findOne(User, { publicId });
    if (!user) {
      return {};
    }

    const s = await this.#em.findOne(SettingsEntity, { user });
    return s?.settings ?? {};
  }

  async saveUserSettings(userPublicId: string, newSettings: Settings): Promise<void> {
    const user = await this.#em.findOne(User, { publicId: userPublicId });
    if (!user) {
      return;
    }

    await this.#em.upsert(SettingsEntity, { user, settings: newSettings });
  }
}
