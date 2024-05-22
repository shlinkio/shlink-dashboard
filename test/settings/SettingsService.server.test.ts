import type { Settings as ShlinkSettingsConfig } from '@shlinkio/shlink-web-component/settings';
import { fromPartial } from '@total-typescript/shoehorn';
import type { EntityManager } from 'typeorm';
import type { Settings } from '../../app/entities/Settings';
import { SettingsEntity } from '../../app/entities/Settings';
import type { User } from '../../app/entities/User';
import { UserEntity } from '../../app/entities/User';
import { SettingsService } from '../../app/settings/SettingsService.server';

describe('SettingsService', () => {
  const findOneBy = vi.fn();
  const upsert = vi.fn();
  const em = fromPartial<EntityManager>({ findOneBy, upsert });
  let settingsService: SettingsService;

  beforeEach(() => {
    settingsService = new SettingsService(em);
  });

  describe('userSettings', () => {
    it('returns no settings when user is not found', async () => {
      findOneBy.mockResolvedValue(null);

      const settings = await settingsService.userSettings(1);

      expect(settings).toEqual({});
      expect(findOneBy).toHaveBeenCalledOnce();
      expect(findOneBy).toHaveBeenCalledWith(UserEntity, { id: 1 });
    });

    it('returns no settings when user does not have any', async () => {
      const user = fromPartial<User>({});
      findOneBy
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(null);

      const settings = await settingsService.userSettings(1);

      expect(settings).toEqual({});
      expect(findOneBy).toHaveBeenCalledTimes(2);
      expect(findOneBy).toHaveBeenNthCalledWith(1, UserEntity, { id: 1 });
      expect(findOneBy).toHaveBeenNthCalledWith(2, SettingsEntity, { user });
    });

    it('returns user settings when found', async () => {
      const user = fromPartial<User>({});
      const settings = fromPartial<ShlinkSettingsConfig>({
        ui: { theme: 'dark' },
        tags: { defaultOrdering: {} },
        shortUrlCreation: { tagFilteringMode: 'includes' },
      });
      findOneBy
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(fromPartial<Settings>({ settings }));

      const result = await settingsService.userSettings(1);

      expect(result).toEqual(settings);
      expect(findOneBy).toHaveBeenCalledTimes(2);
      expect(findOneBy).toHaveBeenNthCalledWith(1, UserEntity, { id: 1 });
      expect(findOneBy).toHaveBeenNthCalledWith(2, SettingsEntity, { user });
    });
  });

  describe('saveUserSettings', () => {
    it('saves nothing when user is not found', async () => {
      findOneBy.mockResolvedValue(null);

      await settingsService.saveUserSettings(1, fromPartial({}));

      expect(findOneBy).toHaveBeenCalledWith(UserEntity, { id: 1 });
      expect(upsert).not.toHaveBeenCalledOnce();
    });

    it('upserts settings when user is found', async () => {
      const user = fromPartial<User>({});
      const newSettings = fromPartial<ShlinkSettingsConfig>({});

      findOneBy.mockResolvedValue(user);

      await settingsService.saveUserSettings(1, newSettings);

      expect(findOneBy).toHaveBeenCalledWith(UserEntity, { id: 1 });
      expect(upsert).toHaveBeenCalledWith(SettingsEntity, { user, settings: newSettings }, ['user']);
    });
  });
});
