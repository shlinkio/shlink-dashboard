import type {
  ShlinkCreateShortUrlData,
  ShlinkEditDomainRedirects, ShlinkEditShortUrlData,
  ShlinkSetRedirectRulesData,
} from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import { ShlinkApiProxyClient } from '../../app/api/ShlinkApiProxyClient.client';

describe('ShlinkApiProxyClient', () => {
  let proxyClient: ShlinkApiProxyClient;
  const fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({}) });

  beforeEach(() => {
    proxyClient = new ShlinkApiProxyClient('123', fetch);
  });

  it.each([
    ['createShortUrl', [fromPartial<ShlinkCreateShortUrlData>({ longUrl: 'https://shlink.io' })]],
    ['deleteOrphanVisits', []],
    ['deleteShortUrl', ['foo', null]],
    ['deleteShortUrlVisits', ['foo', null]],
    ['deleteTags', [['foo', 'bar']]],
    ['editDomainRedirects', [fromPartial<ShlinkEditDomainRedirects>({ domain: 'foo' })]],
    ['editTag', ['foo', 'bar']],
    ['getDomainVisits', ['foo', {}]],
    ['getNonOrphanVisits', [{}]],
    ['getOrphanVisits', [{}]],
    ['getShortUrl', ['foo', null]],
    ['getShortUrlRedirectRules', ['foo', null]],
    ['getShortUrlVisits', ['foo', {}]],
    ['getTagVisits', ['foo', {}]],
    ['getVisitsOverview', []],
    ['health', [null]],
    ['listDomains', []],
    ['listShortUrls', [{}]],
    ['listTags', []],
    ['mercureInfo', []],
    ['setShortUrlRedirectRules', ['foo', null, fromPartial<ShlinkSetRedirectRulesData>({ redirectRules: [] })]],
    ['tagsStats', []],
    ['updateShortUrl', ['foo', null, fromPartial<ShlinkEditShortUrlData>({})]],
  ])('passes function name and args to fetch via RPC call', async (method, args) => {
    // @ts-expect-error Hard to type in a generic way all args for every method
    await proxyClient[method](...args);

    expect(fetch).toHaveBeenCalledWith(`/server/123/shlink-api/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ args }),
    });
  });
});
