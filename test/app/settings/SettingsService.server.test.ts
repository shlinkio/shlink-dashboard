import type { EntityManager } from '@mikro-orm/core';
import type { Settings as ShlinkSettingsConfig } from '@shlinkio/shlink-web-component/settings';
import { fromPartial } from '@total-typescript/shoehorn';
import type { Settings } from '../../../app/entities/Settings';
import { Settings as SettingsEntity } from '../../../app/entities/Settings';
import type { User } from '../../../app/entities/User';
import { User as UserEntity } from '../../../app/entities/User';
import { SettingsService } from '../../../app/settings/SettingsService.server';

describe('SettingsService', () => {
  const findOne = vi.fn();
  const upsert = vi.fn();
  const em = fromPartial<EntityManager>({ findOne, upsert });
  let settingsService: SettingsService;

  beforeEach(() => {
    settingsService = new SettingsService(em);
  });

  describe('userSettings', () => {
    it('returns no settings when user is not found', async () => {
      findOne.mockResolvedValue(null);

      const settings = await settingsService.userSettings('1');

      expect(settings).toEqual({});
      expect(findOne).toHaveBeenCalledOnce();
      expect(findOne).toHaveBeenCalledWith(UserEntity, { publicId: '1' });
    });

    it('returns no settings when user does not have any', async () => {
      const user = fromPartial<User>({});
      findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(null);

      const settings = await settingsService.userSettings('1');

      expect(settings).toEqual({});
      expect(findOne).toHaveBeenCalledTimes(2);
      expect(findOne).toHaveBeenNthCalledWith(1, UserEntity, { publicId: '1' });
      expect(findOne).toHaveBeenNthCalledWith(2, SettingsEntity, { user });
    });

    it('returns user settings when found', async () => {
      const user = fromPartial<User>({});
      const settings = fromPartial<ShlinkSettingsConfig>({
        ui: { theme: 'dark' },
        tags: { defaultOrdering: {} },
        shortUrlCreation: { tagFilteringMode: 'includes' },
      });
      findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(fromPartial<Settings>({ settings }));

      const result = await settingsService.userSettings('1');

      expect(result).toEqual(settings);
      expect(findOne).toHaveBeenCalledTimes(2);
      expect(findOne).toHaveBeenNthCalledWith(1, UserEntity, { publicId: '1' });
      expect(findOne).toHaveBeenNthCalledWith(2, SettingsEntity, { user });
    });
  });

  describe('saveUserSettings', () => {
    it('saves nothing when user is not found', async () => {
      findOne.mockResolvedValue(null);

      await settingsService.saveUserSettings('1', fromPartial({}));

      expect(findOne).toHaveBeenCalledWith(UserEntity, { publicId: '1' });
      expect(upsert).not.toHaveBeenCalledOnce();
    });

    it('upserts settings when user is found', async () => {
      const user = fromPartial<User>({});
      const newSettings = fromPartial<ShlinkSettingsConfig>({});

      findOne.mockResolvedValue(user);

      await settingsService.saveUserSettings('1', newSettings);

      expect(findOne).toHaveBeenCalledWith(UserEntity, { publicId: '1' });
      expect(upsert).toHaveBeenCalledWith(SettingsEntity, { user, settings: newSettings });
    });
  });
});
