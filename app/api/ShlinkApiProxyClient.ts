import type {
  ShlinkApiClient,
  ShlinkCreateShortUrlData,
  ShlinkDeleteVisitsResult,
  ShlinkDomainRedirects,
  ShlinkDomainsList,
  ShlinkEditDomainRedirects, ShlinkEditShortUrlData,
  ShlinkHealth,
  ShlinkMercureInfo,
  ShlinkOrphanVisitsParams,
  ShlinkRedirectRulesList,
  ShlinkSetRedirectRulesData,
  ShlinkShortUrl,
  ShlinkShortUrlsList,
  ShlinkShortUrlsListParams,
  ShlinkShortUrlVisitsParams,
  ShlinkTagsList,
  ShlinkTagsStatsList,
  ShlinkVisitsList,
  ShlinkVisitsOverview,
  ShlinkVisitsParams,
} from '@shlinkio/shlink-js-sdk/api-contract';

export class ShlinkApiProxyClient implements ShlinkApiClient {
  constructor(private readonly serverId: string) {
  }

  createShortUrl(options: ShlinkCreateShortUrlData): Promise<ShlinkShortUrl> {
    return this.performRequest('createShortUrl', options);
  }

  deleteOrphanVisits(): Promise<ShlinkDeleteVisitsResult> {
    return this.performRequest('deleteOrphanVisits');
  }

  deleteShortUrl(shortCode: string, domain?: string | null): Promise<void> {
    return this.performRequest('deleteShortUrl', shortCode, domain);
  }

  deleteShortUrlVisits(shortCode: string, domain?: string | null): Promise<ShlinkDeleteVisitsResult> {
    return this.performRequest('deleteShortUrlVisits', shortCode, domain);
  }

  deleteTags(tags: string[]): Promise<{ tags: string[] }> {
    return this.performRequest('deleteTags', tags);
  }

  editDomainRedirects(domainRedirects: ShlinkEditDomainRedirects): Promise<ShlinkDomainRedirects> {
    return this.performRequest('editDomainRedirects', domainRedirects);
  }

  editTag(oldName: string, newName: string): Promise<{ oldName: string; newName: string }> {
    return this.performRequest('editTag', oldName, newName);
  }

  getDomainVisits(domain: string, params?: ShlinkVisitsParams): Promise<ShlinkVisitsList> {
    return this.performRequest('getDomainVisits', domain, params);
  }

  getNonOrphanVisits(params?: ShlinkVisitsParams): Promise<ShlinkVisitsList> {
    return this.performRequest('getNonOrphanVisits', params);
  }

  getOrphanVisits(params?: ShlinkOrphanVisitsParams): Promise<ShlinkVisitsList> {
    return this.performRequest('getOrphanVisits', params);
  }

  getShortUrl(shortCode: string, domain?: string | null): Promise<ShlinkShortUrl> {
    return this.performRequest('getShortUrl', shortCode, domain);
  }

  getShortUrlRedirectRules(shortCode: string, domain?: string | null): Promise<ShlinkRedirectRulesList> {
    return this.performRequest('getShortUrlRedirectRules', shortCode, domain);
  }

  getShortUrlVisits(shortCode: string, params?: ShlinkShortUrlVisitsParams): Promise<ShlinkVisitsList> {
    return this.performRequest('getShortUrlVisits', shortCode, params);
  }

  getTagVisits(tag: string, params?: ShlinkVisitsParams): Promise<ShlinkVisitsList> {
    return this.performRequest('getTagVisits', tag, params);
  }

  getVisitsOverview(): Promise<ShlinkVisitsOverview> {
    return this.performRequest('getVisitsOverview');
  }

  health(authority?: string): Promise<ShlinkHealth> {
    return this.performRequest('health', authority);
  }

  listDomains(): Promise<ShlinkDomainsList> {
    return this.performRequest('listDomains');
  }

  listShortUrls(params?: ShlinkShortUrlsListParams): Promise<ShlinkShortUrlsList> {
    return this.performRequest('listShortUrls', params);
  }

  listTags(): Promise<ShlinkTagsList> {
    return this.performRequest('listTags');
  }

  mercureInfo(): Promise<ShlinkMercureInfo> {
    return this.performRequest('mercureInfo');
  }

  setShortUrlRedirectRules(
    shortCode: string,
    domain: string | null | undefined,
    data: ShlinkSetRedirectRulesData,
  ): Promise<ShlinkRedirectRulesList> {
    return this.performRequest('setShortUrlRedirectRules', shortCode, domain, data);
  }

  tagsStats(): Promise<ShlinkTagsStatsList> {
    return this.performRequest('tagsStats');
  }

  updateShortUrl(
    shortCode: string,
    domain: string | null | undefined,
    data: ShlinkEditShortUrlData,
  ): Promise<ShlinkShortUrl> {
    return this.performRequest('updateShortUrl', shortCode, domain, data);
  }

  private async performRequest<T>(action: string, ...args: unknown[]): Promise<T> {
    const resp = await fetch(`/server/${this.serverId}/shlink-api/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ args }),
    });
    return resp.json();
  }
}
