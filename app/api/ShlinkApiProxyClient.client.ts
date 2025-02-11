import type {
  Abortable,
  ShlinkApiClient,
  ShlinkCreateShortUrlData,
  ShlinkDeleteVisitsResult,
  ShlinkDomainRedirects,
  ShlinkDomainsList,
  ShlinkEditDomainRedirects,
  ShlinkEditShortUrlData,
  ShlinkHealth,
  ShlinkMercureInfo,
  ShlinkOrphanVisitsParams,
  ShlinkRedirectRulesList,
  ShlinkRenaming,
  ShlinkSetRedirectRulesData,
  ShlinkShortUrl,
  ShlinkShortUrlIdentifier,
  ShlinkShortUrlsList,
  ShlinkShortUrlsListParams,
  ShlinkTagsList,
  ShlinkTagsStatsList,
  ShlinkVisitsList,
  ShlinkVisitsOverview,
  ShlinkVisitsParams,
} from '@shlinkio/shlink-js-sdk/api-contract';

type Fetch = typeof globalThis.fetch;

export class ShlinkApiProxyClient implements ShlinkApiClient {
  readonly #serverId: string;
  readonly #fetch: Fetch;

  constructor(serverId: string, fetch = globalThis.fetch.bind(globalThis)) {
    this.#serverId = serverId;
    this.#fetch = fetch;
  }

  createShortUrl({ signal, ...options }: ShlinkCreateShortUrlData & Abortable): Promise<ShlinkShortUrl> {
    return this.#performRequest('createShortUrl', signal, options);
  }

  deleteOrphanVisits({ signal }: Abortable = {}): Promise<ShlinkDeleteVisitsResult> {
    return this.#performRequest('deleteOrphanVisits', signal);
  }

  deleteShortUrl(shortUrlId: ShlinkShortUrlIdentifier, { signal }: Abortable = {}): Promise<void> {
    return this.#performRequest('deleteShortUrl', signal, shortUrlId);
  }

  deleteShortUrlVisits(
    shortUrlId: ShlinkShortUrlIdentifier,
    { signal }: Abortable = {},
  ): Promise<ShlinkDeleteVisitsResult> {
    return this.#performRequest('deleteShortUrlVisits', signal, shortUrlId);
  }

  deleteTags(tags: string[], { signal }: Abortable = {}): Promise<{ tags: string[] }> {
    return this.#performRequest('deleteTags', signal, tags);
  }

  editDomainRedirects(
    domainRedirects: ShlinkEditDomainRedirects,
    { signal }: Abortable = {},
  ): Promise<ShlinkDomainRedirects> {
    return this.#performRequest('editDomainRedirects', signal, domainRedirects);
  }

  editTag(tagRenaming: ShlinkRenaming, { signal }: Abortable = {}): Promise<ShlinkRenaming> {
    return this.#performRequest('editTag', signal, tagRenaming);
  }

  getDomainVisits(
    domain: string,
    { signal, ...params }: ShlinkVisitsParams & Abortable = {},
  ): Promise<ShlinkVisitsList> {
    return this.#performRequest('getDomainVisits', signal, domain, params);
  }

  getNonOrphanVisits({ signal, ...params }: ShlinkVisitsParams & Abortable = {}): Promise<ShlinkVisitsList> {
    return this.#performRequest('getNonOrphanVisits', signal, params);
  }

  getOrphanVisits({ signal, ...params }: ShlinkOrphanVisitsParams & Abortable = {}): Promise<ShlinkVisitsList> {
    return this.#performRequest('getOrphanVisits', signal, params);
  }

  getShortUrl(shortUrlId: ShlinkShortUrlIdentifier, { signal }: Abortable = {}): Promise<ShlinkShortUrl> {
    return this.#performRequest('getShortUrl', signal, shortUrlId);
  }

  getShortUrlRedirectRules(
    shortUrlId: ShlinkShortUrlIdentifier,
    { signal }: Abortable = {},
  ): Promise<ShlinkRedirectRulesList> {
    return this.#performRequest('getShortUrlRedirectRules', signal, shortUrlId);
  }

  getShortUrlVisits(
    shortUrlId: ShlinkShortUrlIdentifier,
    { signal, ...params }: ShlinkVisitsParams & Abortable = {},
  ): Promise<ShlinkVisitsList> {
    return this.#performRequest('getShortUrlVisits', signal, shortUrlId, params);
  }

  getTagVisits(tag: string, { signal, ...params }: ShlinkVisitsParams & Abortable = {}): Promise<ShlinkVisitsList> {
    return this.#performRequest('getTagVisits', signal, tag, params);
  }

  getVisitsOverview({ signal }: Abortable = {}): Promise<ShlinkVisitsOverview> {
    return this.#performRequest('getVisitsOverview', signal);
  }

  health({ signal, ...options }: { domain?: string } & Abortable = {}): Promise<ShlinkHealth> {
    return this.#performRequest('health', signal, options);
  }

  listDomains({ signal }: Abortable = {}): Promise<ShlinkDomainsList> {
    return this.#performRequest('listDomains', signal);
  }

  listShortUrls({ signal, ...params }: ShlinkShortUrlsListParams & Abortable = {}): Promise<ShlinkShortUrlsList> {
    return this.#performRequest('listShortUrls', signal, params);
  }

  listTags({ signal }: Abortable = {}): Promise<ShlinkTagsList> {
    return this.#performRequest('listTags', signal);
  }

  mercureInfo({ signal }: Abortable = {}): Promise<ShlinkMercureInfo> {
    return this.#performRequest('mercureInfo', signal);
  }

  setShortUrlRedirectRules(
    shortUrlId: ShlinkShortUrlIdentifier,
    { signal, ...data }: ShlinkSetRedirectRulesData & Abortable,
  ): Promise<ShlinkRedirectRulesList> {
    return this.#performRequest('setShortUrlRedirectRules', signal, shortUrlId, data);
  }

  tagsStats({ signal }: Abortable = {}): Promise<ShlinkTagsStatsList> {
    return this.#performRequest('tagsStats', signal);
  }

  updateShortUrl(
    shortUrlId: ShlinkShortUrlIdentifier,
    { signal, ...data }: ShlinkEditShortUrlData & Abortable,
  ): Promise<ShlinkShortUrl> {
    return this.#performRequest('updateShortUrl', signal, shortUrlId, data);
  }

  async #performRequest<T>(action: string, signal?: AbortSignal, ...args: unknown[]): Promise<T> {
    const resp = await this.#fetch(`/server/${this.#serverId}/shlink-api/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ args }),
      signal,
    });
    return resp.json();
  }
}
