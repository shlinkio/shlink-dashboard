import type {
  ShlinkCreateShortUrlData,
  ShlinkEditDomainRedirects,
  ShlinkEditShortUrlData,
  ShlinkRenaming,
  ShlinkSetRedirectRulesData,
  ShlinkShortUrlIdentifier,
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
    ['deleteShortUrl', [fromPartial<ShlinkShortUrlIdentifier>({ shortCode: 'foo' })]],
    ['deleteShortUrlVisits', [fromPartial<ShlinkShortUrlIdentifier>({ shortCode: 'foo' })]],
    ['deleteTags', [['foo', 'bar']]],
    ['editDomainRedirects', [fromPartial<ShlinkEditDomainRedirects>({ domain: 'foo' })]],
    ['editTag', [fromPartial<ShlinkRenaming>({ oldName: 'foo', newName: 'bar' })]],
    ['getDomainVisits', ['foo', {}]],
    ['getNonOrphanVisits', [{}]],
    ['getOrphanVisits', [{}]],
    ['getShortUrl', [fromPartial<ShlinkShortUrlIdentifier>({ shortCode: 'foo' })]],
    ['getShortUrlRedirectRules', [fromPartial<ShlinkShortUrlIdentifier>({ shortCode: 'foo' })]],
    ['getShortUrlVisits', [fromPartial<ShlinkShortUrlIdentifier>({ shortCode: 'foo' }), {}]],
    ['getTagVisits', ['foo', {}]],
    ['getVisitsOverview', []],
    ['health', [{}]],
    ['listDomains', []],
    ['listShortUrls', [{}]],
    ['listTags', []],
    ['mercureInfo', []],
    ['setShortUrlRedirectRules', [
      fromPartial<ShlinkShortUrlIdentifier>({ shortCode: 'foo' }),
      fromPartial<ShlinkSetRedirectRulesData>({ redirectRules: [] }),
    ]],
    ['tagsStats', []],
    ['updateShortUrl', [
      fromPartial<ShlinkShortUrlIdentifier>({ shortCode: 'foo' }),
      fromPartial<ShlinkEditShortUrlData>({}),
    ]],
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
