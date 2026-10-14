import { fromPartial } from '@total-typescript/shoehorn';
import { shouldRevalidate } from '../../app/routes/shlink-component-wrapper';

describe('shlink-component-wrapper', () => {
  describe('shouldRevalidate', () => {
    it.each([
      // Navigation inside the same server
      { nextServerId: 'abc', defaultShouldRevalidate: true, expected: false },
      { nextServerId: 'abc', defaultShouldRevalidate: false, expected: false },
      // Navigation to another server
      { nextServerId: 'def', defaultShouldRevalidate: true, expected: true },
      { nextServerId: 'def', defaultShouldRevalidate: false, expected: false },
    ])(
      'returns $expected for server $nextServerId and default $defaultShouldRevalidate',
      ({ nextServerId, defaultShouldRevalidate, expected }) => {
        const result = shouldRevalidate(
          fromPartial({
            currentParams: { serverId: 'abc' },
            nextParams: { serverId: nextServerId },
            defaultShouldRevalidate,
          }),
        );

        expect(result).toEqual(expected);
      },
    );
  });
});
