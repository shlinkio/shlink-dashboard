import { TagsStorage } from '../../app/tags/TagsStorage.client';

describe('TagsStorage', () => {
  const fetch = vi.fn().mockResolvedValue(undefined);
  const initialColors = { foo: 'red', bar: 'green', baz: 'yellow' };

  const createTagsStorage = () => new TagsStorage(initialColors, '/save', fetch);

  describe('getTagColors', () => {
    it('returns a copy of colors', () => {
      const tagsStorage = createTagsStorage();
      const colors = tagsStorage.getTagColors();

      // Both objects are equal, but they are a copy
      expect(colors === initialColors).toEqual(false);
      expect(initialColors).toEqual(colors);
    });
  });

  describe('storeTagColors', () => {
    it.each([
      [{}],
      [{ bar: 'green' }],
      [{ foo: 'red', bar: 'green', baz: 'yellow' }],
      [{ foo: 'red', baz: 'yellow' }],
    ])('stores no colors if provided ones already exist', (newColors) => {
      const tagsStorage = createTagsStorage();
      tagsStorage.storeTagColors(newColors);

      expect(fetch).not.toHaveBeenCalled();
    });

    it('sends only new colors', () => {
      const tagsStorage = createTagsStorage();
      tagsStorage.storeTagColors({ shlink: 'blue', urls: 'magenta', bar: 'green' });

      expect(fetch).toHaveBeenCalledWith('/save', expect.objectContaining({
        body: JSON.stringify({ shlink: 'blue', urls: 'magenta' }),
      }));
    });
  });
});
